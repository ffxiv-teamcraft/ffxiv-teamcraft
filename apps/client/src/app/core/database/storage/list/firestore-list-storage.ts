import { List } from '../../../../modules/list/model/list';
import { Injectable, NgZone } from '@angular/core';
import { ListStore } from './list-store';
import { combineLatest, from, Observable, of, throwError } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { catchError, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AngularFirestore, DocumentChangeAction, Query, QueryFn } from '@angular/fire/firestore';
import { LazyDataService } from '../../../data/lazy-data.service';
import { ListRow } from '../../../../modules/list/model/list-row';
import { FirestoreRelationalStorage } from '../firestore/firestore-relational-storage';
import { ListTag } from '../../../../modules/list/model/list-tag.enum';
import { Class } from '@kaiu/serializer';
import firebase from 'firebase/app';
import { PermissionLevel } from '../../permissions/permission-level.enum';
import { applyPatch, compare, getValueByPointer } from 'fast-json-patch';

@Injectable({
  providedIn: 'root'
})
export class FirestoreListStorage extends FirestoreRelationalStorage<List> implements ListStore {

  private static readonly PERSISTED_LIST_ROW_PROPERTIES: (keyof ListRow)[] = [
    'amount',
    'done',
    'amount_needed',
    'used',
    'id',
    'icon',
    'recipeId',
    'yield',
    'workingOnIt',
    'requiredAsHQ',
    'custom',
    'attachedRotation',
    'requires',
    'canBeCrafted',
    'hasAllBaseIngredients',
    'craftableAmount',
    'usePrice'
  ];

  constructor(protected af: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private lazyData: LazyDataService) {
    super(af, serializer, zone, pendingChangesService);
  }

  public update(uid: string, localSnapshot: List, update: List, uriParams?: any): Observable<void> {
    this.pendingChangesService.addPendingChange(`List Transaction ${uid}`);
    return from(this.af.firestore.runTransaction(transaction => {
      const ref = this.af.firestore.collection(this.getBaseUri()).doc(uid);
      return transaction.get(ref).then(snap => {
        this.recordOperation('read', uid);
        const serverList = { $key: snap.id, ...snap.data() } as List;
        const before = this.prepareData(localSnapshot);
        const after = this.prepareData(update);
        return this.runTransactionUpdate(ref, transaction, before, after, serverList);
      });
    }).then(() => {
      this.pendingChangesService.removePendingChange(`List Transaction ${uid}`);
    }));
  }

  public prepareData(list: Partial<List>): List {
    const clone: List = JSON.parse(JSON.stringify(list));
    if (typeof clone.createdAt === 'string') {
      clone.createdAt = firebase.firestore.Timestamp.fromDate(new Date(clone.createdAt));
    }
    clone.items = (clone.items || [])
      .filter(item => !item.finalItem)
      .map(item => {
        if (item.custom) {
          return item;
        }
        return FirestoreListStorage.PERSISTED_LIST_ROW_PROPERTIES.reduce((cleanedItem, property) => {
          if (property in item) {
            cleanedItem[property] = item[property];
          }
          return cleanedItem;
        }, {}) as ListRow;
      });
    clone.finalItems = (clone.finalItems || []).map(item => {
      if (item.custom) {
        return item;
      }
      return FirestoreListStorage.PERSISTED_LIST_ROW_PROPERTIES.reduce((cleanedItem, property) => {
        if (property in item) {
          cleanedItem[property] = item[property];
        }
        return cleanedItem;
      }, {}) as ListRow;
    });
    return clone;
  }

  public completeListData(list: List): Observable<List> {
    return this.lazyData.extracts$.pipe(
      map(extracts => {
        list.items = list.items.map(item => {
          if (!(item.requires instanceof Array)) {
            item.requires = [];
          }
          return Object.assign(item, extracts[item.id]);
        });
        list.finalItems = list.finalItems.map(item => {
          if (!(item.requires instanceof Array)) {
            item.requires = [];
          }
          return Object.assign(item, extracts[item.id]);
        });
        list.afterDeserialized();
        if (list.modificationsHistory.length > 25) {
          const popped = list.modificationsHistory.slice(26);
          list.contributionStats = list.getContributionStats(popped, this.lazyData);
          list.modificationsHistory = list.modificationsHistory.slice(0, 25);
        }
        return list;
      })
    );
  }

  private completeLists(lists: List[]): Observable<List[]> {
    if (lists.length === 0) {
      return of([]);
    }
    return combineLatest(lists.filter(list => list.name !== undefined && list.finalItems !== undefined).map(list => this.completeListData(list)));
  }

  public getByForeignKey(foreignEntityClass: Class, foreignKeyValue: string, queryModifier?: (query: Query) => Query, cacheSuffix = ''): Observable<List[]> {
    return super.getByForeignKey(foreignEntityClass, foreignKeyValue, queryModifier, cacheSuffix)
      .pipe(
        switchMap(lists => this.completeLists(lists))
      );
  }

  get(uid: string): Observable<List> {
    return super.get(uid)
      .pipe(
        switchMap(list => {
          return this.completeListData(list);
        })
      );
  }

  public getShared(userId: string): Observable<List[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where(`registry.${userId}`, '>=', PermissionLevel.READ))
      .snapshotChanges()
      .pipe(
        catchError(error => {
          console.error(`GET SHARED LISTS ${this.getBaseUri()}:${userId}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => this.recordOperation('read')),
        switchMap((snaps: DocumentChangeAction<List>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: List = <List>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
              delete snap.payload;
              return valueWithKey;
            });
          return this.completeLists(this.serializer.deserialize<List>(lists, [this.getClass()]));
        })
      );
  }

  public getCommunityLists(tags: string[], name: string): Observable<List[]> {
    if (tags.length === 0 && name.length < 3) {
      return of([]);
    }
    const query: QueryFn = ref => {
      let baseQuery = ref.where(`public`, '==', true);
      if (tags.length > 0) {
        baseQuery = baseQuery.where('tags', 'array-contains', tags[0]);
      }
      if (name !== undefined) {
        baseQuery = baseQuery.where('name', '>=', name);
      }
      return baseQuery;
    };
    return this.firestore.collection(this.getBaseUri(), query)
      .snapshotChanges()
      .pipe(
        catchError(error => {
          console.error(`GET COMMUNITY LISTS`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => this.recordOperation('read')),
        takeUntil(this.stop$.pipe(filter(stop => stop === 'community'))),
        switchMap((snaps: DocumentChangeAction<List>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: List = <List>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
              delete snap.payload;
              return valueWithKey;
            })
            .filter(list => {
              return tags.reduce((res, tag) => res && list.tags.indexOf(<ListTag>tag) > -1, true);
            })
            .filter(list => {
              return list.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
            });
          return this.completeLists(this.serializer.deserialize<List>(lists, [this.getClass()]));
        })
      );
  }

  public getUserCommunityLists(userId: string): Observable<List[]> {
    const query: QueryFn = ref => {
      return ref.where('authorId', '==', userId).where(`public`, '==', true);
    };
    return this.firestore.collection(this.getBaseUri(), query)
      .snapshotChanges()
      .pipe(
        catchError(error => {
          console.error(`GET USER COMMUNITY LISTS ${this.getBaseUri()}:${userId}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => this.recordOperation('read')),
        switchMap((snaps: DocumentChangeAction<List>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: List = <List>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
              delete snap.payload;
              return valueWithKey;
            });
          return this.completeLists(this.serializer.deserialize<List>(lists, [this.getClass()]));
        })
      );
  }

  getPublicListsByAuthor(uid: string): Observable<List[]> {
    return this.listsByAuthorRef(uid).pipe(map(lists => lists.filter(list => list.public === true)));
  }

  byAuthor(uid: string): Observable<List[]> {
    return this.listsByAuthorRef(uid);
  }

  deleteByAuthor(uid: string): Observable<void> {
    return this.listsByAuthorRef(uid)
      .pipe(
        tap(() => this.recordOperation('delete')),
        first(),
        map(lists => lists.map(list => list.$key)),
        switchMap(listIds => {
          const deletion = listIds.map(id => {
            return this.remove(id);
          });
          return combineLatest(deletion).pipe(map(() => null));
        })
      );
  }

  protected getBaseUri(): string {
    return 'lists';
  }

  protected getClass(): any {
    return List;
  }

  private listsByAuthorRef(uid: string): Observable<List[]> {
    return this.firestore
      .collection(this.getBaseUri(), ref => ref.where('authorId', '==', uid).orderBy('createdAt', 'desc'))
      .snapshotChanges()
      .pipe(
        catchError(error => {
          console.error(`GET BY AUTHOR REF ${this.getBaseUri()}:${uid}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => this.recordOperation('read')),
        map((snaps: any[]) => snaps.map(snap => {
          // Issue #227 showed that sometimes, $key gets persisted (probably because of a migration process),
          // Because of that, we have to delete $key property from data snapshot, else the $key won't point to the correct list,
          // Resulting on an unreadable, undeletable list.
          const data = snap.payload.doc.data();
          delete data.$key;
          return <List>{ $key: snap.payload.doc.id, ...data };
        })),
        switchMap((lists: List[]) => {
          return this.completeLists(this.serializer.deserialize<List>(lists, [this.getClass()]));
        })
      );
  }

  private runTransactionUpdate(ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
                               transaction: firebase.firestore.Transaction,
                               before: List, after: List, serverList: List): void {
    // Get diff between local backup and new version
    const diff = compare(before, after);
    // Update the diff so the values are applied to the server list instead
    const transactionDiff = diff.map(change => {
      if (change.op === 'replace' && typeof change.value === 'number') {
        try {
          const currentServerValue = getValueByPointer(serverList, change.path);
          const currentLocalValue = getValueByPointer(before, change.path);
          change.value = change.value - currentLocalValue + currentServerValue;
        } catch (e) {
          console.warn(e);
        }
      }
      return change;
    });
    // Apply patch to the server list
    const patched = applyPatch(serverList, transactionDiff).newDocument;
    // Save inside Database
    transaction.set(ref, patched);
    this.recordOperation('write', before.$key);
  }
}
