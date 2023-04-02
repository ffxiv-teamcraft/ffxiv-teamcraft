import { defer, from, Observable, of, Subject, throwError } from 'rxjs';
import { DataModel } from '../data-model';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { NgZone } from '@angular/core';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { catchError, distinctUntilChanged, filter, finalize, map, retry, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docSnapshots,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  FirestoreDataConverter,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  runTransaction,
  setDoc,
  Transaction,
  UpdateData,
  updateDoc,
  WithFieldValue,
  writeBatch
} from '@angular/fire/firestore';
import { AfterDeserialized } from './after-deserialized';
import { isEqual } from 'lodash';

export abstract class FirestoreStorage<T extends DataModel> {

  protected static OPERATIONS: Record<string, Record<'read' | 'write' | 'delete', number>> = {};

  protected cache: { [index: string]: Observable<T> } = {};

  protected skipClone = false;

  protected regenerateCollectionRef = false;

  protected converter: FirestoreDataConverter<T> = {
    toFirestore: (modelObject: WithFieldValue<T>): DocumentData => {
      const workingCopy: Partial<WithFieldValue<T>> = (this.skipClone ? modelObject : { ...modelObject }) as Partial<WithFieldValue<T>>;
      delete workingCopy.$key;
      delete workingCopy.notFound;
      return this.prepareData(workingCopy);
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot): T => {
      const deserialized = this.serializer.deserialize<T & AfterDeserialized>(this.beforeDeserialization({
        ...snapshot.data(),
        $key: snapshot.id
      } as T), this.getClass());
      if (deserialized['afterDeserialized']) {
        deserialized.afterDeserialized();
      }
      return deserialized;
    }
  };

  protected stop$: Subject<string> = new Subject<string>();

  private _collection: CollectionReference<T>;

  protected get collection() {
    if (!this._collection || this.regenerateCollectionRef) {
      this.regenerateCollectionRef = false;
      this._collection = collection(this.firestore, this.getBaseUri()).withConverter(this.converter);
    }
    return this._collection;
  }

  protected constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
                        protected pendingChangesService: PendingChangesService) {
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

  public clearCache(): void {
    this.cache = {};
  }

  public docRef(key: string): DocumentReference<T> {
    return doc(this.firestore, this.getBaseUri(), key).withConverter(this.converter);
  }

  public query(...filterQuery: QueryConstraint[]): Observable<T[]> {
    return collectionData(query(this.collection, ...filterQuery).withConverter(this.converter)).pipe(
      distinctUntilChanged((a, b) => isEqual(a, b))
    );
  }

  public stopListening(key: string): void {
    this.stop$.next(key);
  }

  add(data: Omit<T, '$key'>, uriParams?: any): Observable<string> {
    return this.zone.runOutsideAngular(() => {
      return from(addDoc(this.collection, data)).pipe(
        catchError(error => {
          console.error(`ADD ${this.getBaseUri()}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => this.recordOperation('write')),
        map(res => res.id)
      );
    });
  }

  get(key: string, forceRefresh = false): Observable<T> {
    if (this.cache[key] === undefined || forceRefresh) {
      this.cache[key] = docSnapshots(this.docRef(key))
        .pipe(
          catchError(error => {
            console.error(`GET ${this.getBaseUri()}/${key}`);
            console.error(error);
            return throwError(error);
          }),
          filter(snap => !snap.metadata.hasPendingWrites),
          map(snap => {
            return snap.data();
          }),
          map(data => {
            if (data === undefined) {
              throw new Error(`GET ${this.getBaseUri()}/${key}: NOT FOUND`);
            }
            return data;
          }),
          distinctUntilChanged((a, b) => isEqual(a, b)),
          tap(() => {
            this.recordOperation('read', key);
          }),
          shareReplay(1)
        ).pipe(
          finalize(() => {
            setTimeout(() => {
              delete this.cache[key];
            });
          })
        );
    }
    return this.cache[key];
  }

  pureUpdate(key: string, data: UpdateData<T>): Observable<void> {
    return this.zone.runOutsideAngular(() => {
      return from(updateDoc(this.docRef(key), data)).pipe(
        catchError(error => {
          console.error(`UPDATE ${this.getBaseUri()}/${key}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => {
          this.recordOperation('write', key);
        })
      );
    });
  }

  update(uid: string, data: T): Observable<void> {
    return this.set(uid, data);
  }

  set(key: string, data: T): Observable<void> {
    this.pendingChangesService.addPendingChange(`set ${this.getBaseUri()}/${key}`);
    return this.zone.runOutsideAngular(() => {
      return from(setDoc(this.docRef(key), data)).pipe(
        catchError(error => {
          console.error(`UPDATE ${this.getBaseUri()}/${key}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => {
          this.recordOperation('write', key);
          this.pendingChangesService.removePendingChange(`set ${this.getBaseUri()}/${key}`);
        })
      );
    });
  }

  remove(key: string, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`remove ${this.getBaseUri()}/${key}`);
    if (key === undefined || key === null || key === '') {
      throw new Error(`Empty uid ${this.getBaseUri()}`);
    }
    return this.zone.runOutsideAngular(() => {
      return from(deleteDoc(this.docRef(key))).pipe(
        catchError(error => {
          console.error(`DELETE ${this.getBaseUri()}/${key}`);
          console.error(error);
          return of(null);
        }),
        tap(() => {
          this.recordOperation('delete', key);
          // If there's cache information, delete it.
          delete this.cache[key];
          this.pendingChangesService.removePendingChange(`remove ${this.getBaseUri()}/${key}`);
        })
      );
    });
  }

  removeMany(keys: string[]): Observable<void> {
    return this.zone.runOutsideAngular(() => {
      const batch = writeBatch(this.firestore);
      keys.forEach(key => {
        batch.delete(this.docRef(key));
      });
      return from(batch.commit());
    });
  }

  setMany(entities: T[]): Observable<void> {
    return this.zone.runOutsideAngular(() => {
      const batch = writeBatch(this.firestore);
      entities
        .filter(entity => !!entity)
        .forEach(entity => {
          batch.set(this.docRef(entity.$key), entity);
        });
      return from(batch.commit());
    });
  }

  /**
   * Run a transaction with server copy of a given entity
   * @param entityId
   * @param transactionFn
   */
  public runTransaction(entityId: string, transactionFn: (transaction: Transaction, serverCopy: DocumentSnapshot<T>) => void): Observable<void> {
    return this.zone.runOutsideAngular(() => {
      return this.runPureTransaction(async (transaction) => {
        const ref = this.docRef(entityId);
        const serverCopy = await transaction.get(ref);
        return transactionFn(transaction, serverCopy);
      });
    });
  }

  /**
   * Run a simple firestore transaction
   * @param transactionFn
   */
  public runPureTransaction(transactionFn: (transaction: Transaction) => Promise<void>): Observable<void> {
    return this.zone.runOutsideAngular(() => {
      return defer(() => runTransaction(this.firestore, transactionFn)).pipe(
        retry({
          count: 3,
          delay: 200
        })
      );
    });
  }

  updateIndexes<R extends T & { index: number }>(rows: Array<R>): Observable<void> {
    return this.zone.runOutsideAngular(() => {
      this.recordOperation('write', rows.map(row => row.$key));
      const batch = writeBatch(this.firestore);
      rows.forEach(row => {
        const ref = this.docRef(row.$key) as DocumentReference<T & { index: number }>;
        return batch.update<T & { index: number }>(ref, { index: row.index } as UpdateData<T & { index: number }>);
      });
      return from(batch.commit());
    });
  }

  public recordOperation(operation: 'read' | 'write' | 'delete', debugData?: any): void {
    if ((window as any).verboseOperations || environment.verboseOperations) {
      console.log('OPERATION', operation, this.getBaseUri(), debugData);
    }
    FirestoreStorage.OPERATIONS[this.getBaseUri()] = FirestoreStorage.OPERATIONS[this.getBaseUri()] || { read: 0, write: 0, delete: 0 };
    FirestoreStorage.OPERATIONS[this.getBaseUri()][operation]++;
  }

  protected prepareData(data: Partial<WithFieldValue<T>>): Partial<WithFieldValue<T>> {
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

  public newId(): string {
    return doc(collection(this.firestore, this.getBaseUri())).id;
  }

  protected beforeDeserialization(data: Partial<T>): T {
    return data as T;
  }

  protected abstract getBaseUri(): string;

  protected abstract getClass(): any;
}
