import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';
import { Alarm } from './alarm';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AlarmsService extends FirestoreRelationalStorage<Alarm> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(params?: any): string {
    return 'alarms';
  }

  protected getClass(): any {
    return Alarm;
  }

}
