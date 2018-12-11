import { Injectable, NgZone } from '@angular/core';
import { FirebaseStorage } from '../storage/firebase/firebase-storage';
import { CustomLink } from './custom-link';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Observable } from 'rxjs';
import { PendingChangesService } from '../pending-changes/pending-changes.service';
import { first, map } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirestoreRelationalStorage } from '../storage/firestore/firestore-relational-storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ListTemplate } from './list-template';


@Injectable()
export class CustomLinksService<T extends CustomLink = CustomLink> extends FirestoreRelationalStorage<T> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getByUriAndNickname(uri: string, nickName: string): Observable<T> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('uri', '==', uri))
      .snapshotChanges()
      .pipe(
        first(),
        map((snaps: any[]) => snaps
          .map(snap => ({ $key: snap.payload.key, ...snap.payload.val() }))
          .map(l => this.serializer.deserialize<T>(l, this.getClass()))
        ),
        map((res: T[]) => res.filter(link => link.authorNickname === nickName)),
        map(res => res[0])
      );
  }

  public getTemplateByListId(listId: string): Observable<ListTemplate> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('originalListId', '==', listId))
      .snapshotChanges()
      .pipe(
        map((snaps: any[]) => snaps
          .map(snap => ({ $key: snap.payload.key, ...snap.payload.val() }))
          .map(l => this.serializer.deserialize<ListTemplate>(l, this.getClass()))
        ),
        map(res => res[0])
      );
  }

  protected getBaseUri(): string {
    return '/custom-links';
  }

  protected getClass(): any {
    return CustomLink;
  }

}
