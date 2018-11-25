import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { CraftingRotation } from '../../model/other/crafting-rotation';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';

@Injectable()
export class CraftingRotationService extends FirestoreRelationalStorage<CraftingRotation> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return '/rotations';
  }

  protected getClass(): any {
    return CraftingRotation;
  }

}
