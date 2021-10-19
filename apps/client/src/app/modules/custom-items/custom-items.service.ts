import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { CustomItem } from './model/custom-item';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';

@Injectable({ providedIn: 'root' })
export class CustomItemsService extends FirestoreRelationalStorage<CustomItem> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(params?: any): string {
    return 'custom-items';
  }

  protected getClass(): any {
    return CustomItem;
  }

}
