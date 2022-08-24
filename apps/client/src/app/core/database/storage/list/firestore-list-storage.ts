import { List } from '../../../../modules/list/model/list';
import { Injectable, NgZone } from '@angular/core';
import { ListStore } from './list-store';
import { combineLatest, from, Observable, of, Subject, throwError } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { catchError, first, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { AngularFirestore, DocumentChangeAction, Query, QueryFn } from '@angular/fire/compat/firestore';
import { ListRow } from '../../../../modules/list/model/list-row';
import { FirestoreRelationalStorage } from '../firestore/firestore-relational-storage';
import { Class } from '@kaiu/serializer';
import firebase from 'firebase/compat/app';
import { PermissionLevel } from '../../permissions/permission-level.enum';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { ListController } from '../../../../modules/list/list-controller';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ModificationEntry } from '../../../../modules/list/model/modification-entry';

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
    'craftableAmount'
  ];

  constructor(protected af: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private lazyData: LazyDataFacade,
              private http: HttpClient) {
    super(af, serializer, zone, pendingChangesService);
  }

  public prepareData(list: Partial<List>): List {
    if (!list) {
      return list as List;
    }
    const clone: List = JSON.parse(JSON.stringify(list));
    if (typeof clone.createdAt === 'string') {
      clone.createdAt = firebase.firestore.Timestamp.fromDate(new Date(clone.createdAt));
    }
    clone.createdAt = new firebase.firestore.Timestamp(clone.createdAt.seconds || Math.floor(Date.now() / 1000), 0);
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
    return combineLatest([
      this.lazyData.getEntry('extracts')
    ]).pipe(
      map(([extracts]) => {
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
        ListController.afterDeserialized(list);
        return list;
      })
    );
  }

  public getByForeignKey(foreignEntityClass: Class, foreignKeyValue: string, queryModifier?: (query: Query) => Query, cacheSuffix = ''): Observable<List[]> {
    return super.getByForeignKey(foreignEntityClass, foreignKeyValue, queryModifier, cacheSuffix)
      .pipe(
        switchMap(lists => this.completeLists(lists))
      );
  }

  public getByForeignKeyRaw(foreignEntityClass: Class, foreignKeyValue: string, queryModifier?: (query: Query) => Query, cacheSuffix = ''): Observable<Partial<List>[]> {
    return super.getByForeignKey(foreignEntityClass, foreignKeyValue, queryModifier, cacheSuffix);
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
    if (tags.length === 0 && name.length < 5) {
      return of([]);
    }
    let params = new HttpParams();
    if (tags.length > 0) {
      params = params.set('tags', tags.join(','));
    }
    if (name) {
      params = params.set('name', name);
    }
    return this.http.get<{ lists: List[] }>('https://us-central1-ffxivteamcraft.cloudfunctions.net/searchCommunityLists', { params }).pipe(
      switchMap(res => {
        return this.completeLists(this.serializer.deserialize<List>((res.lists || []), [this.getClass()]));
      })
    );
  }

  getModificationsHistory(listId: string): Observable<ModificationEntry[]> {
    return this.firestore.collection(`/lists/${listId}/history`).snapshotChanges().pipe(
      tap(() => this.recordOperation('read', 'history')),
      map((snaps: DocumentChangeAction<ModificationEntry>[]) => {
        return snaps
          .map((snap: DocumentChangeAction<any>) => {
            const valueWithKey: ModificationEntry = <ModificationEntry>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
            delete snap.payload;
            return valueWithKey;
          });
      })
    );
  }

  addModificationsHistoryEntry(listId: string, entry: ModificationEntry): Observable<void> {
    const res$ = new Subject<void>();
    from(this.firestore.collection(`/lists/${listId}/history`).add(entry)).pipe(
      tap(() => this.recordOperation('write', 'history')),
      mapTo(null),
      first()
    ).subscribe(() => {
      res$.next();
    });
    return res$;
  }

  incrementModificationsHistoryEntry(listId: any, entry: { key: string; increment: number }) {
    const res$ = new Subject<void>();
    from(this.firestore.collection(`/lists/${listId}/history`).doc(entry.key).update({ amount: firebase.firestore.FieldValue.increment(entry.increment) })).pipe(
      tap(() => this.recordOperation('write', 'history')),
      mapTo(null),
      first()
    ).subscribe(() => {
      res$.next();
    });
    return res$;
  }

  removeModificationsHistoryEntry(listId: string, entryId: string): Observable<void> {
    return from(this.firestore.collection(`/lists/${listId}/history`).doc(entryId).delete()).pipe(
      tap(() => this.recordOperation('delete', 'history')),
      mapTo(null)
    );
  }

  resetModificationsHistory(listId: string): Observable<void> {
    const res$ = new Subject<void>();
    this.getModificationsHistory(listId).pipe(
      first(),
      switchMap(history => {
        const batches = [this.af.firestore.batch()];
        let ops = 0;
        let index = 0;
        history.forEach(entry => {
          const batch = batches[index];
          batch.delete(this.firestore.collection(`/lists/${listId}/history`).doc(entry.$key).ref);
          ops++;
          if (ops >= 450) {
            batches.push(this.af.firestore.batch());
            ops = 0;
            index++;
          }
        });
        return combineLatest(batches.map(batch => from(batch.commit().catch(e => console.log(e)))));
      }),
      first()
    ).subscribe(() => {
      res$.next();
    }, error => console.log(error));
    return res$;
  }

  migrateListModificationEntries(list: List): Observable<void> {
    const batches = [this.af.firestore.batch()];
    let ops = 0;
    let index = 0;
    (list as any).modificationsHistory.forEach((entry: ModificationEntry) => {
      batches[index].set(this.af.firestore.collection(`/lists/${list.$key}/history`).doc(this.af.createId()), entry);
      ops++;
      if (ops >= 450) {
        batches.push(this.af.firestore.batch());
        ops = 0;
        index++;
      }
    });
    if ((list as any).modificationsHistory.length === 0) {
      const newList = ListController.clone(list, true);
      delete (newList as any).modificationsHistory;
      delete (newList as any).contributionStats;
      return this.set(list.$key, newList);
    }
    return combineLatest(batches.map(batch => from(batch.commit().catch(e => console.log(e))))).pipe(
      switchMap(() => {
        const newList = ListController.clone(list, true);
        delete (newList as any).modificationsHistory;
        delete (newList as any).contributionStats;
        return this.set(list.$key, newList);
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

  private completeLists(lists: List[]): Observable<List[]> {
    if (lists.length === 0) {
      return of([]);
    }
    return combineLatest(lists.filter(list => list.name !== undefined && list.finalItems !== undefined).map(list => this.completeListData(list)));
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
}
