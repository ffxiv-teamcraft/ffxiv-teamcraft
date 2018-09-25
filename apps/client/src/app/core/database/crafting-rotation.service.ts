import { Injectable, NgZone } from '@angular/core';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Observable } from 'rxjs';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { CraftingRotation } from '../../model/other/crafting-rotation';
import { map } from 'rxjs/internal/operators';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';

@Injectable()
export class CraftingRotationService extends FirestoreStorage<CraftingRotation> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  getUserRotations(uid: string): Observable<CraftingRotation[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('authorId', '==', uid))
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<CraftingRotation>[]) => {
          const rotations = snaps.map(snap => {
            const valueWithKey: CraftingRotation = <CraftingRotation>{ $key: snap.payload.doc.id, ...snap.payload.doc.data() };
            delete snap.payload;
            return valueWithKey;
          });
          return this.serializer.deserialize<CraftingRotation>(rotations, [this.getClass()]);
        })
      );
  }

  protected getBaseUri(): string {
    return '/rotations';
  }

  protected getClass(): any {
    return CraftingRotation;
  }

}
