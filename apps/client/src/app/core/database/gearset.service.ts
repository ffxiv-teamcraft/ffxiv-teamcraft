import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone, inject } from '@angular/core';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class GearsetService extends FirestoreRelationalStorage<TeamcraftGearset> {
  protected firestore: Firestore;
  protected serializer: NgSerializerService;
  protected zone: NgZone;
  protected pendingChangesService: PendingChangesService;


  constructor() {
    const firestore = inject(Firestore);
    const serializer = inject(NgSerializerService);
    const zone = inject(NgZone);
    const pendingChangesService = inject(PendingChangesService);

    super(firestore, serializer, zone, pendingChangesService);
  
    this.firestore = firestore;
    this.serializer = serializer;
    this.zone = zone;
    this.pendingChangesService = pendingChangesService;
  }

  protected getBaseUri(): string {
    return 'gearsets';
  }

  protected getClass(): any {
    return TeamcraftGearset;
  }
}
