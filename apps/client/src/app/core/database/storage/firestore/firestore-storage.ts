import { from, Observable, of, Subject } from 'rxjs';
import { DataModel } from '../data-model';
import { DataStore } from '../data-store';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { NgZone } from '@angular/core';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { catchError, filter, map, takeUntil, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Instantiable } from '@kaiu/serializer';
import { environment } from '../../../../../environments/environment';

export abstract class FirestoreStorage<T extends DataModel> extends DataStore<T> {

  protected cache: { [index: string]: Observable<T> } = {};

  protected syncCache: { [index: string]: T } = {};

  protected skipClone = false;

  protected stop$: Subject<string> = new Subject<string>();

  protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                        protected pendingChangesService: PendingChangesService) {
    super();
  }

  protected prepareData(data: Partial<T>): T {
    const clone: Partial<T> = JSON.parse(JSON.stringify(data));
    delete clone.$key;
    Object.keys(clone).forEach(key => {
      if (clone[key] === undefined) {
        delete clone[key];
      }
    });
    clone.appVersion = environment.version;
    return clone as T;
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
      map(res => res.id)
    );
  }

  get(uid: string, uriParams?: any): Observable<T> {
    if (this.cache[uid] === undefined) {
      this.cache[uid] = this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).snapshotChanges()
        .pipe(
          map((snap: any) => {
            const valueWithKey: T = <T>{ ...snap.payload.data(), $key: snap.payload.id };
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

  pureUpdate(uid: string, data: any, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).update(data)).pipe(
      tap(() => {
        this.pendingChangesService.removePendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

  update(uid: string, data: Partial<T>, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error('Empty uid');
    }
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).update(this.prepareData(data))).pipe(
      tap(() => {
        this.pendingChangesService.removePendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

  set(uid: string, data: T, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`set ${this.getBaseUri(uriParams)}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error('Empty uid');
    }
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).set(this.prepareData(data))).pipe(
      tap(() => {
        this.pendingChangesService.removePendingChange(`set ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

  remove(uid: string, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`remove ${this.getBaseUri(uriParams)}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error('Empty uid');
    }
    // Delete subcollections before data, else we can't rely on parent data for permissions
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).delete()).pipe(
      catchError(() => {
        return of(null);
      }),
      tap(() => {
        // If there's cache information, delete it.
        delete this.cache[uid];
        delete this.syncCache[uid];
        this.pendingChangesService.removePendingChange(`remove ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

}
