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

  protected skipClone = false;

  protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                        protected pendingChangesService: PendingChangesService) {
    super();
    this.subcollections = Reflect.getMetadata(METADATA_SUBCOLLECTIONS_INDEX, new (<Instantiable>this.getClass())()) || [];
  }

  protected prepareData(data: Partial<T>): { parent: T, subcollections: { [index: string]: any[] } } {
    const parent = JSON.parse(this.serializer.serialize(data));
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

  private diff(before: any[], after: any[], trackBy: (row: any) => string | number): DataDiff[] {
    const additions = [];
    const deletions = [];
    const modifications = [];
    before.forEach(bEntry => {
      const entryComparator = trackBy(bEntry);
      const aEntry = after.find(afterEntry => trackBy(afterEntry) === entryComparator);
      if (!aEntry) {
        deletions.push({ ...bEntry });
      } else {
        const aEntryCopy = { ...aEntry };
        const bEntryCopy = { ...bEntry };
        delete aEntryCopy.$key;
        delete bEntryCopy.$key;
        if (!isEqual(aEntryCopy, bEntryCopy)) {
          modifications.push({
            after: { ...aEntry },
            before: { ...bEntry }
          });
        }
      }
    });
    after.forEach(aEntry => {
      if (!before.some(bEntry => trackBy(bEntry) === trackBy(aEntry))) {
        additions.push({ ...aEntry });
      }
    });
    return [
      ...additions.map(addition => {
        return {
          $key: this.firestore.createId(),
          type: DiffType.ADDITION,
          data: addition
        };
      }),
      ...deletions.map(deletion => {
        return {
          $key: deletion.$key,
          type: DiffType.DELETION
        };
      }),
      ...modifications.map(modification => {
        const key = modification.after.$key || modification.before.$key || this.firestore.createId();
        delete modification.after.$key;
        delete modification.before.$key;
        return {
          $key: key,
          type: DiffType.MODIFICATION,
          data: modification.after
        };
      })
    ];
  }

  private handleSubcollectionChanges(baseUri: string, documentId: string, subcollection: string, before: any[], after: any[], trackBy: (e: any) => string | number): Observable<any> {
    const diffData = this.diff(before, after, trackBy);
    const changes = [
      ...diffData.filter(change => change.$key === undefined),
      ...uniqBy(diffData.filter(change => change.$key !== undefined), '$key')
    ];
    const batches = [this.firestore.firestore.batch()];
    let operations = 0;
    if (baseUri.indexOf('lists/') > -1) {
      const toMigrate = after.filter((element) => {
        return element.$key === undefined && !changes.some(change => {
          return trackBy(change.data) === trackBy(element);
        });
      });
      toMigrate.forEach(migration => {
        let batch = batches[operations % 500];
        if (batch === undefined) {
          batches[operations % 500] = this.firestore.firestore.batch();
          batch = batches[operations % 500];
        }
        batch.set(this.firestore.collection(baseUri)
          .doc(documentId)
          .collection(subcollection)
          .doc(this.firestore.createId())
          .ref, migration);
        operations++;
      });
    }
    changes
      .forEach(change => {
        let batch = batches[operations % 500];
        if (batch === undefined) {
          batches[operations % 500] = this.firestore.firestore.batch();
          batch = batches[operations % 500];
        }
        switch (change.type) {
          case DiffType.ADDITION:
            batch.set(this.firestore.collection(baseUri)
              .doc(documentId)
              .collection(subcollection)
              .doc(change.$key)
              .ref, change.data);
            break;
          case DiffType.DELETION:
            batch.delete(this.firestore.collection(baseUri)
              .doc(documentId)
              .collection(subcollection)
              .doc(change.$key)
              .ref);
            break;
          case DiffType.MODIFICATION:
            // TODO Maybe use update instead here, if only one number has been changed for instance
            batch.set(this.firestore.collection(baseUri)
              .doc(documentId)
              .collection(subcollection)
              .doc(change.$key)
              .ref, change.data);
            break;
        }
        operations++;
      });
    if (operations === 0) {
      return of(null);
    }
    return combineLatest(batches.map(batch => from(batch.commit()))).pipe(debounceTime(500));
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
      this.cache[uid] = this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).snapshotChanges()
        .pipe(
          map((snap: any) => {
            const valueWithKey: T = <T>{ $key: snap.payload.id, ...snap.payload.data() };
            if (!snap.payload.exists) {
              throw new Error(`${this.getBaseUri(uriParams)}/${uid} Not found`);
            }
            const res = this.serializer.deserialize<T>(valueWithKey, this.getClass());
            if ((res as any).afterDeserialized) {
              (res as any).afterDeserialized();
            }
            return res;
          }),
          tap(res => this.syncCache[uid] = res)
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
          return Object.assign(clone, JSON.parse(JSON.stringify(data)));
        }
      })
    );
  }

  pureUpdate(uid: string, data: Partial<T>, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
    return from(this.firestore.collection(this.getBaseUri(uriParams)).doc(uid).update(data)).pipe(
      tap(() => {
        this.pendingChangesService.removePendingChange(`update ${this.getBaseUri(uriParams)}/${uid}`);
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
