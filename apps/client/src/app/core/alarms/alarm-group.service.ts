import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';
import { AlarmGroup } from './alarm-group';
import { Injectable, NgZone, inject } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AlarmGroupService extends FirestoreRelationalStorage<AlarmGroup> {
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
    return 'alarm-groups';
  }

  protected getClass(): any {
    return AlarmGroup;
  }

}
