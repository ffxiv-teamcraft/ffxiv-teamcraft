import { Injectable, NgZone } from '@angular/core';
import { Workshop } from '../../model/other/workshop';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WorkshopService extends FirestoreRelationalStorage<Workshop> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getShared(userId: string): Observable<Workshop[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where(`registry.${userId}`, '>=', 20))
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<Workshop>[]) => {
          const workshops = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: Workshop = <Workshop>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
              delete snap.payload;
              return valueWithKey;
            });
          return this.serializer.deserialize<Workshop>(workshops, [this.getClass()]);
        })
      );
  }

  protected getBaseUri(): string {
    return '/workshops';
  }

  protected getClass(): any {
    return Workshop;
  }

}
