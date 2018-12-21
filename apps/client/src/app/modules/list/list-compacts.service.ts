import { List } from './model/list';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { Observable } from 'rxjs';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';


@Injectable()
export class ListCompactsService extends FirestoreRelationalStorage<List> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getWithWriteAccess(userId: string): Observable<List[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where(`registry.${userId}`, '>=', 30))
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

  public getCommunityLists(): Observable<List[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where(`public`, '==', true))
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
