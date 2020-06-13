import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { LogTracking } from '../../model/user/log-tracking';
import { from, Observable } from 'rxjs';
import * as firebase from 'firebase/app';

@Injectable({ providedIn: 'root' })
export class LogTrackingService extends FirestoreStorage<LogTracking> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public markAsDone(uid: string, itemId: number, log: keyof LogTracking, done = true): Observable<any> {
    return from(this.firestore.firestore.runTransaction(transaction => {
      const docRef = this.firestore.firestore.doc(`${this.getBaseUri()}/${uid}`);
      return transaction.get(docRef)
        .then(doc => {
          if (!doc.exists && done) {
            const newLog = {
              crafting: [],
              gathering: []
            };
            newLog[log].push(itemId);
            transaction.set(docRef, newLog);
          } else {
            if (done) {
              transaction.update(docRef, {
                [log]: firebase.firestore.FieldValue.arrayUnion(itemId)
              });
            } else {
              transaction.update(docRef, {
                [log]: firebase.firestore.FieldValue.arrayRemove(itemId)
              });
            }
          }
        });
    }));
  }

  protected getBaseUri(): string {
    return '/log-tracking';
  }

  protected getClass(): any {
    return LogTracking;
  }

}
