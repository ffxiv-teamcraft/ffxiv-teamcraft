import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { CommissionProfile } from '../../model/user/commission-profile';
import { FiredReason } from '../../modules/commission-board/model/fired-reason';
import { Observable } from 'rxjs';

import { ResignedReason } from '../../modules/commission-board/model/resigned-reason';
import { arrayUnion, Firestore, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommissionProfileService extends FirestoreStorage<CommissionProfile> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public addFiredFeedback(userId: string, commissionId: string, reason: FiredReason): Observable<void> {
    return this.pureUpdate(userId, {
      firedFeedbacks: arrayUnion({
        commissionId,
        reason,
        date: Timestamp.now()
      })
    });
  }

  public addResignedFeedback(userId: string, commissionId: string, reason: ResignedReason): Observable<void> {
    return this.pureUpdate(userId, {
      resignedFeedback: arrayUnion({
        commissionId,
        reason,
        date: Timestamp.now()
      })
    });
  }

  protected getBaseUri(): string {
    return 'commission-profile';
  }

  protected getClass(): any {
    return CommissionProfile;
  }
}
