import { List } from '../../../../modules/list/model/list';
import { Injectable, NgZone } from '@angular/core';
import { combineLatest, Observable, of, throwError } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ListRow } from '../../../../modules/list/model/list-row';
import { FirestoreRelationalStorage } from '../firestore/firestore-relational-storage';
import { Class } from '@kaiu/serializer';
import { PermissionLevel } from '../../permissions/permission-level.enum';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { ListController } from '../../../../modules/list/list-controller';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Firestore, QueryConstraint, Timestamp, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreListStorage extends FirestoreRelationalStorage<List> {

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

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private lazyData: LazyDataFacade,
              private http: HttpClient) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public prepareData(list: Partial<List>): List {
    if (!list) {
      return list as List;
    }
    const clone: List = JSON.parse(JSON.stringify(list));
    if (typeof clone.createdAt === 'string') {
      clone.createdAt = Timestamp.fromDate(new Date(clone.createdAt));
    }
    clone.createdAt = new Timestamp(clone.createdAt.seconds || Math.floor(Date.now() / 1000), 0);
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
    return ListController.updateEtag(clone);
  }

  public completeListData(list: List): Observable<List> {
    return this.lazyData.getEntry('extracts').pipe(
      map((extracts) => {
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

  public getByForeignKey(foreignEntityClass: Class, foreignKeyValue: string, additionalFilters: QueryConstraint[] = [], cacheSuffix = ''): Observable<List[]> {
    return super.getByForeignKey(foreignEntityClass, foreignKeyValue, additionalFilters, cacheSuffix)
      .pipe(
        switchMap(lists => this.completeLists(lists))
      );
  }

  public getByForeignKeyRaw(foreignEntityClass: Class, foreignKeyValue: string, additionalFilters: QueryConstraint[] = [], cacheSuffix = ''): Observable<Partial<List>[]> {
    return super.getByForeignKey(foreignEntityClass, foreignKeyValue, additionalFilters, cacheSuffix);
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
    return this.query(where(`registry.${userId}`, '>=', PermissionLevel.READ))
      .pipe(
        catchError(error => {
          console.error(`GET SHARED LISTS ${this.getBaseUri()}:${userId}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => this.recordOperation('read')),
        switchMap(lists => this.completeLists(lists))
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

  public getUserCommunityLists(userId: string): Observable<List[]> {
    return this.query(where('authorId', '==', userId), where(`public`, '==', true))
      .pipe(
        catchError(error => {
          console.error(`GET USER COMMUNITY LISTS ${this.getBaseUri()}:${userId}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => this.recordOperation('read')),
        switchMap(lists => this.completeLists(lists))
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
}
