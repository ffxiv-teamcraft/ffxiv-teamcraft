import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';
import { AlarmGroup } from './alarm-group';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AlarmGroupService extends FirestoreRelationalStorage<AlarmGroup> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(params?: any): string {
    return 'alarm-groups';
  }

  protected getClass(): any {
    return AlarmGroup;
  }

}
