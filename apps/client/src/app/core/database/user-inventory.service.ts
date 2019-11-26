import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { UserInventory } from '../../model/user/inventory/user-inventory';

@Injectable({
  providedIn: 'root'
})
export class UserInventoryService extends FirestoreStorage<UserInventory> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return '/user-inventories';
  }

  protected getClass(): any {
    return UserInventory;
  }

}
