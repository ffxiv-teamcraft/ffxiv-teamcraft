import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../database/pending-changes/pending-changes.service';
import { AbstractNotification } from './abstract-notification';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirestoreRelationalStorage } from '../database/storage/firestore/firestore-relational-storage';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends FirestoreRelationalStorage<AbstractNotification> {

  protected skipClone = true;

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
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
