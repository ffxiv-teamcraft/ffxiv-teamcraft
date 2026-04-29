import { Injectable, NgZone, inject } from '@angular/core';
import { Workshop } from '../../model/other/workshop';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { Firestore } from '@angular/fire/firestore';

@Injectable()
export class WorkshopService extends FirestoreRelationalStorage<Workshop> {
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
    return '/workshops';
  }

  protected getClass(): any {
    return Workshop;
  }

}
