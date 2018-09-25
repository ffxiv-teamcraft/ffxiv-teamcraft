import { List } from './model/list';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';


@Injectable()
export class ListService extends FirestoreRelationalStorage<List> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(params?: any): string {
    return 'lists';
  }

  protected getClass(): any {
    return List;
  }
}
