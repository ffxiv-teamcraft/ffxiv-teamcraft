import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { CraftingReplay } from '../../modules/crafting-replay/model/crafting-replay';

@Injectable({
  providedIn: 'root'
})
export class CraftingReplayDbService extends FirestoreRelationalStorage<CraftingReplay> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return '/crafting-replays';
  }

  protected getClass(): any {
    return CraftingReplay;
  }

}
