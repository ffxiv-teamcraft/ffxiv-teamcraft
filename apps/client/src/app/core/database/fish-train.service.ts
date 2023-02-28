import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { PersistedFishTrain } from '../../model/other/persisted-fish-train';
import { Injectable, NgZone } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';

@Injectable({
  providedIn: 'root'
})
export class FishTrainService extends FirestoreStorage<PersistedFishTrain> {
  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return 'fish-train';
  }

  protected getClass(): any {
    return PersistedFishTrain;
  }

}
