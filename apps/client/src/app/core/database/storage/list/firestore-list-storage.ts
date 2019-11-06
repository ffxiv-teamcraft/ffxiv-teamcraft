import { List } from '../../../../modules/list/model/list';
import { Injectable, NgZone } from '@angular/core';
import { ListStore } from './list-store';
import { combineLatest, from, Observable, of } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { filter, first, map, switchMap, takeUntil } from 'rxjs/operators';
import { AngularFirestore, DocumentChangeAction, QueryFn } from '@angular/fire/firestore';
import { LazyDataService } from '../../../data/lazy-data.service';
import { ListRow } from '../../../../modules/list/model/list-row';
import { diff } from 'deep-diff';
import { FirestoreRelationalStorage } from '../firestore/firestore-relational-storage';
import { ListTag } from '../../../../modules/list/model/list-tag.enum';
import { Class } from '@kaiu/serializer';

@Injectable({
  providedIn: 'root'
})
export class FirestoreListStorage extends FirestoreRelationalStorage<List> implements ListStore {

  private static readonly PERSISTED_LIST_ROW_PROPERTIES = ['amount', 'done', 'amount_needed', 'used', 'id', 'icon', 'recipeId', 'yield', 'workingOnIt', 'requiredAsHQ', 'custom', 'attachedRotation', 'requires'];

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private lazyData: LazyDataService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected prepareData(list: Partial<List>): { parent: List; subcollections: { [p: string]: any[] } } {
    const clone: List = JSON.parse(JSON.stringify(list));
    clone.items = (clone.items || []).map(item => {
      if (item.custom) {
        return item;
      }
      return FirestoreListStorage.PERSISTED_LIST_ROW_PROPERTIES.reduce((cleanedItem, property) => {
        cleanedItem[property] = item[property];
        return cleanedItem;
      }, {}) as ListRow;
    });
    clone.finalItems = (clone.finalItems || []).map(item => {
      if (item.custom) {
        return item;
      }
      return FirestoreListStorage.PERSISTED_LIST_ROW_PROPERTIES.reduce((cleanedItem, property) => {
        cleanedItem[property] = item[property];
        return cleanedItem;
      }, {}) as ListRow;
    });
    return super.prepareData(clone);
  }

  private completeListData(list: List): Observable<List> {
    return this.lazyData.extracts$.pipe(
      map(extracts => {
        list.items = list.items.map(item => {
          if (!(item.requires instanceof Array)) {
            item.requires = [];
          }
          return Object.assign(item, extracts.find(i => i.id === item.id));
        });
        list.finalItems = list.finalItems.map(item => {
          if (!(item.requires instanceof Array)) {
            item.requires = [];
          }
          return Object.assign(item, extracts.find(i => i.id === item.id));
        });
        return list;
      })
    );
  }

  public getByForeignKey(foreignEntityClass: Class, foreignKeyValue: string, uriParams?: any): Observable<List[]> {
    return super.getByForeignKey(foreignEntityClass, foreignKeyValue, uriParams)
      .pipe(
        switchMap(lists => combineLatest(lists.map(list => this.completeListData(list))))
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
    return this.firestore.collection(this.getBaseUri(), ref => ref.where(`registry.${userId}`, '>=', 20))
      .snapshotChanges()
      .pipe(
        switchMap((snaps: DocumentChangeAction<List>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: List = <List>{ $key: snap.payload.doc.id, ...snap.payload.doc.data() };
              delete snap.payload;
              return valueWithKey;
            });
          return combineLatest(this.serializer.deserialize<List>(lists, [this.getClass()])
            .map(list => this.completeListData(list)));
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
        takeUntil(this.stop$.pipe(filter(stop => stop === 'community'))),
        switchMap((snaps: DocumentChangeAction<List>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: List = <List>{ $key: snap.payload.doc.id, ...snap.payload.doc.data() };
              delete snap.payload;
              return valueWithKey;
            })
            .filter(list => {
              return tags.reduce((res, tag) => res && list.tags.indexOf(<ListTag>tag) > -1, true);
            })
            .filter(list => {
              return list.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
            });
          return combineLatest(this.serializer.deserialize<List>(lists, [this.getClass()])
            .map(list => this.completeListData(list)));
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
        switchMap((snaps: DocumentChangeAction<List>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: List = <List>{ $key: snap.payload.doc.id, ...snap.payload.doc.data() };
              delete snap.payload;
              return valueWithKey;
            });
          return combineLatest(this.serializer.deserialize<List>(lists, [this.getClass()])
            .map(list => this.completeListData(list)));
        })
      );
  }

  /**
   * Performs atomic update on every list item, must be used only for progression input
   * @param uid
   * @param data
   * @param uriParams
   */
  atomicUpdate(uid: string, data: Partial<List>, uriParams?: any): Observable<void> {
    const previousValue = this.prepareData(this.syncCache[uid]).parent;
    const preparedList = this.prepareData(data).parent;
    const itemsDiff = diff(previousValue.items, preparedList.items);
    const finalItemsDiff = diff(previousValue.finalItems, preparedList.finalItems);
    const listRef = this.firestore.collection(this.getBaseUri()).doc(uid).ref;
    return from(this.firestore.firestore.runTransaction(transaction => {
      return transaction.get(listRef).then(listDoc => {
        const list = listDoc.data();
        list.modificationsHistory = preparedList.modificationsHistory;
        (itemsDiff || []).forEach(itemDiff => {
          list.items[itemDiff.path[0]][itemDiff.path[1]] += itemDiff.rhs - itemDiff.lhs;
        });
        (finalItemsDiff || []).forEach(itemDiff => {
          list.finalItems[itemDiff.path[0]][itemDiff.path[1]] += itemDiff.rhs - itemDiff.lhs;
        });
        transaction.set(listRef, list);
      });
    }));
  }

  getPublicLists(): Observable<List[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('public', '==', true))
      .snapshotChanges()
      .pipe(
        switchMap((snaps: any[]) => combineLatest(snaps.map(snap => this.completeListData({ $key: snap.payload.doc.id, ...snap.payload.doc.data() })))),
        map((lists: any[]) => this.serializer.deserialize<List>(lists, [List])),
        map((lists: List[]) => lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
        first()
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
        map((snaps: any[]) => snaps.map(snap => {
          // Issue #227 showed that sometimes, $key gets persisted (probably because of a migration process),
          // Because of that, we have to delete $key property from data snapshot, else the $key won't point to the correct list,
          // Resulting on an unreadable, undeletable list.
          const data = snap.payload.doc.data();
          delete data.$key;
          return <List>{ $key: snap.payload.doc.id, ...data };
        })),
        switchMap((lists: List[]) => {
          return combineLatest(this.serializer.deserialize<List>(lists, [List]).map(list => this.completeListData(list)));
        })
      );
  }
}
