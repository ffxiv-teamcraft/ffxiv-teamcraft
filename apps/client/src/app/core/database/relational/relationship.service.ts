import { FirestoreStorage } from '../storage/firestore/firestore-storage';
import { Relationship } from './relationship';
import { Observable } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { NgZone } from '@angular/core';
import { PendingChangesService } from '../pending-changes/pending-changes.service';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

export abstract class RelationshipService<T extends Relationship<any, any>> extends FirestoreStorage<T> {

  protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                        protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getByFrom(from: string): Observable<T[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('from', '==', from))
      .snapshotChanges()
      .pipe(
        map((snaps: any[]) => snaps.map(snap => ({ ...snap.payload.doc.data(), $key: snap.payload.doc.id }))),
        map((lists: any[]) => this.serializer.deserialize<T>(lists, [this.getClass()]))
      );
  }

  public getByTo(to: string): Observable<T[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('to', '==', to))
      .snapshotChanges()
      .pipe(
        map((snaps: any[]) => snaps.map(snap => ({ ...snap.payload.doc.data(), $key: snap.payload.doc.id }))),
        map((lists: any[]) => this.serializer.deserialize<T>(lists, [this.getClass()]))
      );
  }

  public getBaseUri(): string {
    return `relationships/${this.getRelationCollection()}/registry`;
  }

  protected abstract getRelationCollection(): string;
}
