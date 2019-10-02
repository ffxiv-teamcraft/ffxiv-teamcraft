import { combineLatest, from, Observable, of } from 'rxjs';
import { DataModel } from '../data-model';
import { DataStore } from '../data-store';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { NgZone } from '@angular/core';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { METADATA_SUBCOLLECTION, METADATA_SUBCOLLECTIONS_INDEX } from './subcollection';
import { Instantiable } from '@kaiu/serializer';
import { DataDiff } from './data-diff';
import { DiffType } from './diff-type';
import { isEqual, uniqBy } from 'lodash';

export abstract class FirestoreStorage<T extends DataModel> extends DataStore<T> {

  protected readonly subcollections: string[];

  protected cache: { [index: string]: Observable<T> } = {};

  protected syncCache: { [index: string]: T } = {};

  protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                        protected pendingChangesService: PendingChangesService) {
    super();
    this.subcollections = Reflect.getMetadata(METADATA_SUBCOLLECTIONS_INDEX, new (<Instantiable>this.getClass())()) || [];
  }

  private prepareData(data: Partial<T>): { parent: T, subcollections: { [index: string]: any[] } } {
    const parent = JSON.parse(JSON.stringify(data));
    delete parent.$key;
    delete parent.notFound;
    const subcollectionsData = {};
    this.subcollections.forEach(subcollection => {
      subcollectionsData[subcollection] = parent[subcollection];
      delete parent[subcollection];
    });
    return {
      parent: parent,
      subcollections: subcollectionsData
    };
  }

  add(data: T, uriParams?: any): Observable<string> {
    const preparedData = this.prepareData(data);
    const newId = this.firestore.createId();
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(newId).set(preparedData.parent))
      .pipe(
        switchMap(() => {
          if (this.subcollections.length === 0) {
            return of(null);
          }
          return combineLatest([].concat.apply([], this.subcollections
            .filter(subcollection => {
              return preparedData.subcollections[subcollection] && preparedData.subcollections[subcollection].length > 0;
            })
            .map(subcollection => {
              return preparedData.subcollections[subcollection].map(el => {
                return this.firestore.collection(this.getBaseUri(uriParams))
                  .doc(newId)
                  .collection(subcollection)
                  .add(el);
              });
            })));
        }),
        map(() => {
          return newId;
        })
      );
  }

  get(uid: string, uriParams?: any): Observable<T> {
    if (this.cache[uid] === undefined) {
      this.cache[uid] = combineLatest([
        this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).snapshotChanges(),
        ...this.subcollections.map(subcollection => {
          return this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).collection(subcollection).snapshotChanges()
            .pipe(
              map(changes => ({ changes: changes, subcollection: subcollection }))
            );
        })
      ]).pipe(
        debounceTime(250),
        map((snaps: any[]) => {
          const snap = snaps[0];
          const valueWithKey: T = <T>{ $key: snap.payload.id, ...snap.payload.data() };
          if (!snap.payload.exists) {
            throw new Error(`${this.getBaseUri(uriParams)}/${uid} Not found`);
          }
          this.subcollections.forEach(subcollection => {
            valueWithKey[subcollection] = valueWithKey[subcollection] || [];
          });
          snaps.slice(1).forEach(subSnaps => {
            subSnaps.changes
              .filter(change => change.payload !== undefined)
              .forEach(change => {
                const subValueWithKey = { $key: change.payload.doc.id, ...change.payload.doc.data() };
                valueWithKey[subSnaps.subcollection].push(subValueWithKey);
              });
          });
          const res = this.serializer.deserialize<T>(valueWithKey, this.getClass());
          if ((res as any).afterDeserialized) {
            (res as any).afterDeserialized();
          }
          this.subcollections.forEach(subcollection => {
            res[subcollection] = uniqBy(res[subcollection], '$key');
          });
          return res;
        }),
        tap(res => this.syncCache[uid] = res)
      );
    }
    return this.cache[uid].pipe(
      map(data => {
        if ((<any>data).clone && typeof (<any>data).clone === 'function') {
          return (<any>data).clone(true);
        } else {
          const clone = new (<Instantiable>this.getClass())();
          return Object.assign(clone, JSON.parse(JSON.stringify(data)));
        }
      })
    );
  }

  update(uid: string, data: Partial<T>, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
    const preparedData = this.prepareData(data);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error('Empty uid');
    }
    const previousData = this.syncCache[uid];
    let subOperations: Observable<any>;
    if (this.subcollections.length === 0) {
      subOperations = of(null);
    } else {
      subOperations = combineLatest(this.subcollections
        .filter(subcollection => {
          return preparedData.subcollections[subcollection] !== undefined;
        })
        .map(subcollection => {
          const trackBy = Reflect.getMetadata(METADATA_SUBCOLLECTION, data, subcollection);
          return this.handleSubcollectionChanges(this.getBaseUri(uriParams), uid, subcollection, previousData[subcollection], preparedData.subcollections[subcollection], trackBy);
        }));
    }
    return subOperations.pipe(
      switchMap(() => {
        return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).update(preparedData.parent));
      }),
      tap(() => {
        this.pendingChangesService.removePendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
      })
    );
  }

  set(uid: string, data: T, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`set ${this.getBaseUri(uriParams)}/${uid}`);
    const preparedData = this.prepareData(data);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error('Empty uid');
    }
    const previousData = this.syncCache[uid];
    let subOperations: Observable<any>;
    if (this.subcollections.length === 0) {
      subOperations = of(null);
    } else {
      subOperations = combineLatest(this.subcollections
        .filter(subcollection => {
          return preparedData.subcollections[subcollection] !== undefined;
        })
        .map(subcollection => {
          const trackBy = Reflect.getMetadata(METADATA_SUBCOLLECTION, data, subcollection);
          return this.handleSubcollectionChanges(this.getBaseUri(uriParams), uid, subcollection, previousData[subcollection], preparedData.subcollections[subcollection], trackBy);
        }));
    }
    return subOperations.pipe(
      switchMap(() => {
        return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).set(preparedData.parent));
      }),
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
    let subcollectionsDelete: Observable<any>;
    if (this.subcollections.length === 0) {
      subcollectionsDelete = of(null);
    } else {
      subcollectionsDelete = combineLatest(this.subcollections.map(subcollection => {
        return this.firestore.collection(this.getBaseUri(uriParams))
          .doc(uid)
          .collection(subcollection)
          .get()
          .pipe(
            switchMap(collection => {
              return collection.docs.map(doc => {
                return this.firestore.collection(this.getBaseUri(uriParams))
                  .doc(uid)
                  .collection(subcollection)
                  .doc(doc.id)
                  .delete();
              });
            })
          );
      }));
    }
    // Delete subcollections before data, else we can't rely on parent data for permissions
    return subcollectionsDelete.pipe(
      switchMap(() => {
        return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).delete());
      }),
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
