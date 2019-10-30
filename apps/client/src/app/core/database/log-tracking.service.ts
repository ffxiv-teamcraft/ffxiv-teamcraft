import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { LogTracking } from '../../model/user/log-tracking';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogTrackingService extends FirestoreStorage<LogTracking> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public set(uid: string, data: LogTracking, uriParams?: any): Observable<void> {
    console.log('SET', data, uid);
    return super.set(uid, data, uriParams);
  }

  protected getBaseUri(): string {
    return '/log-tracking';
  }

  protected getClass(): any {
    return LogTracking;
  }

}
