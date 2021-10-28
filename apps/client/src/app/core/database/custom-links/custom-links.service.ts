import { Injectable, NgZone } from '@angular/core';
import { CustomLink } from './custom-link';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Observable } from 'rxjs';
import { PendingChangesService } from '../pending-changes/pending-changes.service';
import { first, map, tap } from 'rxjs/operators';
import { FirestoreRelationalStorage } from '../storage/firestore/firestore-relational-storage';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';


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
        tap(() => this.recordOperation('read')),
        first(),
        map((snaps: DocumentChangeAction<any>[]) => snaps
          .map(snap => ({ ...snap.payload.doc.data(), $key: snap.payload.doc.id }))
          .map(l => this.serializer.deserialize<T>(l, this.getClass()))
        ),
        map((res: T[]) => res.filter(link => link.authorNickname === nickName)),
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
