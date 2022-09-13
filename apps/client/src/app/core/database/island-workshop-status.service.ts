import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { WorkshopStatusData } from '../../pages/island-workshop/workshop-status-data';

@Injectable({
  providedIn: 'root'
})
export class IslandWorkshopStatusService extends FirestoreRelationalStorage<WorkshopStatusData> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return '/mji-workshop-status';
  }

  protected getClass(): any {
    return WorkshopStatusData;
  }

}
