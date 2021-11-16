import { Injectable, NgZone } from '@angular/core';
import { Workshop } from '../../model/other/workshop';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';

@Injectable()
export class WorkshopService extends FirestoreRelationalStorage<Workshop> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return '/workshops';
  }

  protected getClass(): any {
    return Workshop;
  }

}
