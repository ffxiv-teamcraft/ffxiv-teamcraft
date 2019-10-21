import { List } from '../../../../modules/list/model/list';
import { Injectable, NgZone } from '@angular/core';
import { ListStore } from './list-store';
import { combineLatest, from, Observable } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirestoreStorage } from '../firestore/firestore-storage';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { first, map, switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { LazyDataService } from '../../../data/lazy-data.service';
import { ListRow } from '../../../../modules/list/model/list-row';
import { diff } from 'deep-diff';

@Injectable({
  providedIn: 'root'
})
export class FirestoreListStorage extends FirestoreStorage<List> implements ListStore {

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

  private completeListData(list: List): List {
    list.items = list.items.map(item => {
      if (!(item.requires instanceof Array)) {
        item.requires = [];
      }
      return Object.assign(item, this.lazyData.extracts.find(i => i.id === item.id));
    });
    list.finalItems = list.finalItems.map(item => {
      if (!(item.requires instanceof Array)) {
        item.requires = [];
      }
      return Object.assign(item, this.lazyData.extracts.find(i => i.id === item.id));
    });
    return list;
  }

  get(uid: string): Observable<List> {
    return super.get(uid).pipe(
      map(list => {
        return this.completeListData(list);
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
        map((snaps: any[]) => snaps.map(snap => this.completeListData({ $key: snap.payload.doc.id, ...snap.payload.doc.data() }))),
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
          return this.completeListData(<List>{ $key: snap.payload.doc.id, ...data });
        })),
        map((lists: List[]) => this.serializer.deserialize<List>(lists, [List]))
      );
  }
}
