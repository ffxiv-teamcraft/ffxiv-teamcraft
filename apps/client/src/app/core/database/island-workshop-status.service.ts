import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { WorkshopStatusData } from '../../pages/island-workshop/workshop-status-data';
import { Firestore } from '@angular/fire/firestore';
import { EnvironmentService } from '../environment.service';

@Injectable({
  providedIn: 'root'
})
export class IslandWorkshopStatusService extends FirestoreRelationalStorage<WorkshopStatusData> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private environment: EnvironmentService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return this.environment.gameVersion < 6.3 ? '/mji-workshop-status-pre63' : '/mji-workshop-status';
  }

  protected getClass(): any {
    return WorkshopStatusData;
  }

}
