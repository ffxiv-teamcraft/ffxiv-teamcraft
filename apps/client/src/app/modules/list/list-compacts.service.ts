import { List } from './model/list';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';


@Injectable()
export class ListCompactsService extends FirestoreRelationalStorage<List> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
              protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  add(data: List, uriParams?: any): Observable<string> {
    throw new Error('This is a readonly service');
  }

  set(uid: string, data: List, uriParams?: any): Observable<void> {
    throw new Error('This is a readonly service');
  }

  remove(uid: string, uriParams?: any): Observable<void> {
    throw new Error('This is a readonly service');
  }

  protected getBaseUri(params?: any): string {
    return 'compacts/collections/lists';
  }

  protected getClass(): any {
    return List;
  }
}
