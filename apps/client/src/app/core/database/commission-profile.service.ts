import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { CommissionProfile } from '../../model/user/commission-profile';

@Injectable({
  providedIn: 'root'
})
export class CommissionProfileService extends FirestoreStorage<CommissionProfile> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(params?: any): string {
    return 'commission-profile';
  }

  protected getClass(): any {
    return CommissionProfile;
  }
}
