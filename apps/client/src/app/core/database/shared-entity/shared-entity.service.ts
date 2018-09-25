import { FirestoreStorage } from '../storage/firestore/firestore-storage';
import { SharedEntity } from './shared-entity';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../pending-changes/pending-changes.service';
import { Injectable, NgZone } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class SharedEntityService extends FirestoreStorage<SharedEntity> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return 'shared-entities';
  }

  protected getClass(): any {
    return SharedEntity;
  }

}
