import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';

@Injectable({ providedIn: 'root' })
export class GearsetService extends FirestoreRelationalStorage<TeamcraftGearset> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(params?: any): string {
    return 'gearsets';
  }

  protected getClass(): any {
    return TeamcraftGearset;
  }
}
