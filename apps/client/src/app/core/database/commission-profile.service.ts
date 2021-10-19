import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommissionProfile } from '../../model/user/commission-profile';
import { FiredReason } from '../../modules/commission-board/model/fired-reason';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { ResignedReason } from '../../modules/commission-board/model/resigned-reason';

@Injectable({
  providedIn: 'root'
})
export class CommissionProfileService extends FirestoreStorage<CommissionProfile> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public addFiredFeedback(userId: string, commissionId: string, reason: FiredReason): Observable<void> {
    return this.pureUpdate(userId, {
      firedFeedbacks: firebase.firestore.FieldValue.arrayUnion({
        commissionId,
        reason,
        date: firebase.firestore.Timestamp.now()
      })
    });
  }

  public addResignedFeedback(userId: string, commissionId: string, reason: ResignedReason): Observable<void> {
    return this.pureUpdate(userId, {
      resignedFeedback: firebase.firestore.FieldValue.arrayUnion({
        commissionId,
        reason,
        date: firebase.firestore.Timestamp.now()
      })
    });
  }

  protected getBaseUri(params?: any): string {
    return 'commission-profile';
  }

  protected getClass(): any {
    return CommissionProfile;
  }
}
