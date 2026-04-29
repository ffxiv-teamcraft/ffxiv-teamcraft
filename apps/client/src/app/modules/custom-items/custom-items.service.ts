import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { CustomItem } from './model/custom-item';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone, inject } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class CustomItemsService extends FirestoreRelationalStorage<CustomItem> {
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
    return 'custom-items';
  }

  protected getClass(): any {
    return CustomItem;
  }

}
