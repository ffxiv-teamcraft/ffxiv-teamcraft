import { ResourceComment } from './resource-comment';
import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { CommentTargetType } from './comment-target-type';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable()
export class CommentsService extends FirestoreRelationalStorage<ResourceComment> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  getComments(type: CommentTargetType, id: string, details = 'none'): Observable<ResourceComment[]> {
    const queryFn = (ref) => ref.where('targetType', '==', type).where('targetId', '==', id).where('targetDetails', '==', details);
    return this.firestore
      .collection(this.getBaseUri(), queryFn)
      .snapshotChanges()
      .pipe(
        map(snaps => snaps.map(snap => {
          const data: ResourceComment = <ResourceComment>snap.payload.doc.data();
          delete data.$key;
          return (<ResourceComment>{ $key: snap.payload.doc.id, ...data });
        })),
        map(comments => this.serializer.deserialize<ResourceComment>(comments, [ResourceComment])),
        map(comments => comments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  protected getBaseUri(params?: any): string {
    return 'comments';
  }

  protected getClass(): any {
    return ResourceComment;
  }

}
