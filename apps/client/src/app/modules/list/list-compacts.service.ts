import { List } from './model/list';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { Observable, of } from 'rxjs';
import { AngularFirestore, DocumentChangeAction, QueryFn } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { ListTag } from './model/list-tag.enum';


@Injectable()
export class ListCompactsService extends FirestoreRelationalStorage<List> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getShared(userId: string): Observable<List[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where(`registry.${userId}`, '>=', 20))
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<List>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: List = <List>{ $key: snap.payload.doc.id, ...snap.payload.doc.data() };
              delete snap.payload;
              return valueWithKey;
            });
          return this.serializer.deserialize<List>(lists, [this.getClass()]);
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
      return baseQuery;
    };
    return this.firestore.collection(this.getBaseUri(), query)
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<List>[]) => {
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
          return this.serializer.deserialize<List>(lists, [this.getClass()]);
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
        map((snaps: DocumentChangeAction<List>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: List = <List>{ $key: snap.payload.doc.id, ...snap.payload.doc.data() };
              delete snap.payload;
              return valueWithKey;
            });
          return this.serializer.deserialize<List>(lists, [this.getClass()]);
        })
      );
  }

  protected getBaseUri(params?: any): string {
    return 'compacts/collections/lists';
  }

  protected getClass(): any {
    return List;
  }
}
