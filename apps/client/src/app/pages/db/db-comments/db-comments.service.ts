import { Injectable, NgZone } from '@angular/core';
import { FirestoreStorage } from '../../../core/database/storage/firestore/firestore-storage';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../../../core/database/pending-changes/pending-changes.service';
import { DbComment } from './model/db-comment';
import { Observable } from 'rxjs';
import { Class } from '@kaiu/serializer';
import { METADATA_FOREIGN_KEY_REGISTRY } from '../../../core/database/relational/foreign-key';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DbCommentsService extends FirestoreStorage<DbComment> {

  protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                        protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getComments(resourceId: string): Observable<DbComment[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('resourceId', '==', resourceId))
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<DbComment>[]) => {
          const comments = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: DbComment = <DbComment>{ $key: snap.payload.doc.id, ...snap.payload.doc.data() };
              delete snap.payload;
              return valueWithKey;
            });
          return this.serializer.deserialize<DbComment>(comments, [this.getClass()]);
        })
      );
  }

  protected getBaseUri(params?: any): string {
    return 'db-comments';
  }

  protected getClass(): any {
    return DbComment;
  }
}
