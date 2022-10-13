import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';
import { AlarmGroup } from './alarm-group';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AlarmGroupService extends FirestoreRelationalStorage<AlarmGroup> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return 'alarm-groups';
  }

  protected getClass(): any {
    return AlarmGroup;
  }

}
