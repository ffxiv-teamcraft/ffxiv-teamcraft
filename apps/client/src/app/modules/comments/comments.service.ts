import { ResourceComment } from './resource-comment';
import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone, inject } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { CommentTargetType } from './comment-target-type';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Firestore, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommentsService extends FirestoreRelationalStorage<ResourceComment> {
  protected firestore: Firestore;
  protected serializer: NgSerializerService;
  protected zone: NgZone;
  protected pendingChangesService: PendingChangesService;


  constructor() {
    const firestore = inject(Firestore);
    const serializer = inject(NgSerializerService);
    const zone = inject(NgZone);
    const pendingChangesService = inject(PendingChangesService);

    super(firestore, serializer, zone, pendingChangesService);
  
    this.firestore = firestore;
    this.serializer = serializer;
    this.zone = zone;
    this.pendingChangesService = pendingChangesService;
  }

  getComments(type: CommentTargetType, id: string, details = 'none'): Observable<ResourceComment[]> {
    return this.query(where('targetType', '==', type), where('targetId', '==', id), where('targetDetails', '==', details))
      .pipe(
        map(comments => comments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  protected getBaseUri(): string {
    return 'comments';
  }

  protected getClass(): any {
    return ResourceComment;
  }

}
