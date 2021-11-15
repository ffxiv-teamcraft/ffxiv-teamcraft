import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { CustomItemFolder } from './model/custom-item-folder';

@Injectable({ providedIn: 'root' })
export class CustomItemFoldersService extends FirestoreRelationalStorage<CustomItemFolder> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(params?: any): string {
    return 'custom-item-folders';
  }

  protected getClass(): any {
    return CustomItemFolder;
  }

}
