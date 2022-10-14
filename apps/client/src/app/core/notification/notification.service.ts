import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { AbstractNotification } from './abstract-notification';
import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends FirestoreRelationalStorage<AbstractNotification> {

  protected skipClone = true;

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return 'notifications';
  }

  protected getClass(): any {
    return AbstractNotification;
  }

}
