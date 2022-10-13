import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';
import { Alarm } from './alarm';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { from, Observable } from 'rxjs';
import { Firestore, writeBatch } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AlarmsService extends FirestoreRelationalStorage<Alarm> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public deleteAll(alarms: Alarm[]): Observable<void> {
    const batch = writeBatch(this.firestore);
    alarms.forEach(alarm => {
      batch.delete(this.docRef(alarm.$key));
    });
    return from(batch.commit());
  }

  protected getBaseUri(): string {
    return 'alarms';
  }

  protected getClass(): any {
    return Alarm;
  }

}
