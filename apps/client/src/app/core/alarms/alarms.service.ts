import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';
import { PersistedAlarm } from './persisted-alarm';
import { Injectable, NgZone, inject } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { from, Observable } from 'rxjs';
import { Firestore, writeBatch } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AlarmsService extends FirestoreRelationalStorage<PersistedAlarm> {
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

  public setAlarmDone(key: string): void {
    localStorage.setItem(`alarm:${key}:done`, new Date().toString());
  }

  public deleteAll(alarms: PersistedAlarm[]): Observable<void> {
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
    return PersistedAlarm;
  }

  beforeDeserialization(data: Partial<PersistedAlarm>): PersistedAlarm {
    return data as PersistedAlarm;
  }
}
