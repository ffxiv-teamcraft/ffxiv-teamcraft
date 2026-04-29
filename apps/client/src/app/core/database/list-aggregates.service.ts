import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { Firestore } from '@angular/fire/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone, inject } from '@angular/core';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { ListAggregate } from '../../modules/list-aggregate/model/list-aggregate';

@Injectable({ providedIn: 'root' })
export class ListAggregatesService extends FirestoreRelationalStorage<ListAggregate> {
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

  protected getBaseUri(): string {
    return '/list-aggregates';
  }

  protected getClass(): any {
    return ListAggregate;
  }
}
