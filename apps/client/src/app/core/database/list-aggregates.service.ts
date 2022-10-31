import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { Firestore } from '@angular/fire/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { ListAggregate } from '../../modules/list-aggregate/model/list-aggregate';

@Injectable({ providedIn: 'root' })
export class ListAggregatesService extends FirestoreRelationalStorage<ListAggregate> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return '/list-aggregates';
  }

  protected getClass(): any {
    return ListAggregate;
  }
}
