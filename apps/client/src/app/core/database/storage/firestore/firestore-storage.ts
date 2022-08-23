import { defer, from, Observable, of, Subject, throwError } from 'rxjs';
import { DataModel } from '../data-model';
import { DataStore } from '../data-store';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { NgZone } from '@angular/core';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { catchError, distinctUntilChanged, filter, map, retry, takeUntil, tap } from 'rxjs/operators';
import { Action, AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Instantiable } from '@kaiu/serializer';
import { environment } from '../../../../../environments/environment';
import firebase from 'firebase/compat/app';
import { compare } from 'fast-json-patch';
import FieldValue = firebase.firestore.FieldValue;

export abstract class FirestoreStorage<T extends DataModel> extends DataStore<T> {

  protected static OPERATIONS: Record<string, Record<'read' | 'write' | 'delete', number>> = {};

  protected cache: { [index: string]: Observable<T> } = {};

  protected syncCache: { [index: string]: T } = {};

  protected skipClone = false;

  protected stop$: Subject<string> = new Subject<string>();

  protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                        protected pendingChangesService: PendingChangesService) {
    super();
    (window as any).getOperationsStats = () => {
      const totals = {
        read: 0,
        write: 0,
        delete: 0
      };
      Object.entries(FirestoreStorage.OPERATIONS).forEach(([uri, stats]) => {
        console.group(uri);
        Object.entries(stats).forEach(([op, count]) => {
          console.log(`${op}: ${count}`);
          totals[op] += count;
        });
        console.groupEnd();
      });
      console.group('TOTALS');
      Object.entries(totals).forEach(([op, count]) => {
        console.log(`${op}: ${count}`);
      });
      console.groupEnd();
    };
  }

  public stopListening(key: string, cacheEntry?: string): void {
    this.stop$.next(key);
    if (cacheEntry) {
      delete this.syncCache[cacheEntry];
      delete this.cache[cacheEntry];
    }
  }

  add(data: T, uriParams?: any): Observable<string> {
    return from(this.firestore.collection(this.getBaseUri(uriParams)).add(this.prepareData(data))).pipe(
      catchError(error => {
        console.error(`ADD ${this.getBaseUri(uriParams)}`);
        console.error(error);
        return throwError(error);
      }),
      tap(() => this.recordOperation('write', data.$key)),
      map(res => res.id)
    );
  }

  get(uid: string, uriParams?: any): Observable<T> {
    if (this.cache[uid] === undefined) {
      this.cache[uid] = this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).snapshotChanges()
        .pipe(
          filter(change => !change.payload.metadata.fromCache),
          catchError(error => {
            console.error(`GET ${this.getBaseUri(uriParams)}/${uid}`);
            console.error(error);
            return throwError(error);
          }),
          distinctUntilChanged((a, b) => compare(a.payload.data(), b.payload.data()).length === 0),
          tap(() => {
            this.recordOperation('read', uid);
          }),
          map((snap: Action<DocumentSnapshot<T>>) => {
            const valueWithKey: T = this.beforeDeserialization(<T>{ ...snap.payload.data(), $key: snap.payload.id });
            if (!snap.payload.exists) {
              throw new Error(`${this.getBaseUri(uriParams)}/${uid} Not found`);
            }
            const res = this.serializer.deserialize<T>(valueWithKey, this.getClass());
            if ((res as any).afterDeserialized) {
              (res as any).afterDeserialized();
            }
            return res;
          }),
          tap(res => {
            this.syncCache[uid] = res;
          }),
          takeUntil(this.stop$.pipe(filter(stop => stop === uid)))
        );
    }
    return this.cache[uid].pipe(
      map(data => {
        if (this.skipClone) {
          return data;
        }
        if ((<any>data).clone && typeof (<any>data).clone === 'function') {
          return (<any>data).clone(true);
        } else {
          const clone = new (<Instantiable>this.getClass())();
          return Object.assign(clone, { ...data });
        }
      })
    );
  }

  pureUpdate(uid: string, data: Partial<T | Record<string, FieldValue>>, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).update(data)).pipe(
      catchError(error => {
        console.error(`UPDATE ${this.getBaseUri(uriParams)}/${uid}`);
        console.error(error);
        return throwError(error);
      }),
      tap(() => {
        this.recordOperation('write', uid);
        this.pendingChangesService.removePendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

  update(uid: string, data: Partial<T>, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error(`Empty uid ${this.getBaseUri(uriParams)}`);
    }
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).update(this.prepareData(data))).pipe(
      catchError(error => {
        console.error(`UPDATE ${this.getBaseUri(uriParams)}/${uid}`);
        console.error(error);
        return throwError(error);
      }),
      tap(() => {
        this.recordOperation('write', uid);
        this.pendingChangesService.removePendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

  set(uid: string, data: T, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`set ${this.getBaseUri(uriParams)}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error(`Empty uid ${this.getBaseUri(uriParams)}`);
    }
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).set(this.prepareData(data))).pipe(
      catchError(error => {
        console.error(`SET ${this.getBaseUri(uriParams)}/${uid}`);
        console.error(error);
        return throwError(error);
      }),
      tap(() => {
        this.recordOperation('write', uid);
        this.pendingChangesService.removePendingChange(`set ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

  remove(uid: string, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`remove ${this.getBaseUri(uriParams)}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error(`Empty uid ${this.getBaseUri(uriParams)}`);
    }
    // Delete subcollections before data, else we can't rely on parent data for permissions
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).delete()).pipe(
      catchError(error => {
        console.error(`DELETE ${this.getBaseUri(uriParams)}/${uid}`);
        console.error(error);
        return of(null);
      }),
      tap(() => {
        this.recordOperation('delete', uid);
        // If there's cache information, delete it.
        delete this.cache[uid];
        delete this.syncCache[uid];
        this.pendingChangesService.removePendingChange(`remove ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

  removeMany(keys: string[], uriParams?: any): Observable<void> {
    const batch = this.firestore.firestore.batch();
    keys.forEach(key => {
      batch.delete(this.firestore.collection(this.getBaseUri(uriParams)).doc(key).ref);
    });
    return from(batch.commit());
  }

  setMany(entities: T[], uriParams?: any): Observable<void> {
    const batch = this.firestore.firestore.batch();
    entities
      .filter(entity => !!entity)
      .forEach(entity => {
        batch.set(this.firestore.collection(this.getBaseUri(uriParams)).doc(entity.$key).ref, this.prepareData(entity));
      });
    return from(batch.commit());
  }

  public runTransaction(listId: string, transactionFn: (transaction: firebase.firestore.Transaction, serverCopy: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => void): Observable<void> {
    return defer(() =>
      this.firestore.firestore.runTransaction(async transaction => {
        const ref = this.firestore.firestore.collection(this.getBaseUri()).doc(listId);
        const serverCopy = await transaction.get(ref);
        return transactionFn(transaction, serverCopy);
      })
    ).pipe(
      retry({
        count: 3,
        delay: 200
      })
    );
  }

  updateIndexes<R extends T & { index: number }>(rows: Array<R>): Observable<void> {
    this.recordOperation('write', rows.map(row => row.$key));
    const batch = this.firestore.firestore.batch();
    rows.forEach(row => {
      const ref = this.firestore.firestore.collection(this.getBaseUri()).doc(row.$key);
      return batch.update(ref, { index: row.index });
    });
    return from(batch.commit());
  }

  public recordOperation(operation: 'read' | 'write' | 'delete', debugData?: any): void {
    if ((window as any).verboseOperations || environment.verboseOperations) {
      console.log('OPERATION', operation, this.getBaseUri(), debugData);
    }
    FirestoreStorage.OPERATIONS[this.getBaseUri()] = FirestoreStorage.OPERATIONS[this.getBaseUri()] || { read: 0, write: 0, delete: 0 };
    FirestoreStorage.OPERATIONS[this.getBaseUri()][operation]++;
  }

  protected prepareData(data: Partial<T>): any {
    if ((data as any).onBeforePrepareData) {
      (data as any).onBeforePrepareData();
    }
    const clone: Partial<T> = JSON.parse(JSON.stringify(data));
    delete clone.$key;
    Object.keys(clone).forEach(key => {
      if (clone[key] === undefined) {
        delete clone[key];
      }
    });
    clone.appVersion = environment.version;
    return clone;
  }

  protected beforeDeserialization(data: Partial<T>): T {
    return data as T;
  }
}
