import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class GearsetService extends FirestoreRelationalStorage<TeamcraftGearset> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return 'gearsets';
  }

  protected getClass(): any {
    return TeamcraftGearset;
  }
}
