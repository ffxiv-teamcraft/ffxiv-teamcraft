import { Injectable, NgZone } from '@angular/core';
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

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return 'mappy';
  }

  protected getClass(): Class {
    return MappyEntry;
  }

}
