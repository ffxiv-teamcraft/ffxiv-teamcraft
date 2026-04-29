import { Injectable, NgZone, inject } from '@angular/core';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { Class } from '@kaiu/serializer';
import { Firestore } from '@angular/fire/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { MappyEntry } from './mappy/mappy-entry';

@Injectable({
  providedIn: 'root'
})
export class MappyService extends FirestoreStorage<MappyEntry> {
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
    return 'mappy';
  }

  protected getClass(): Class {
    return MappyEntry;
  }

}
