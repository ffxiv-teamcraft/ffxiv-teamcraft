import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { LogTracking } from '../../model/user/log-tracking';
import { from, Observable } from 'rxjs';
import firebase from 'firebase/app';

interface MarkAsDoneEntry {
  itemId: number;
  log: keyof LogTracking;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class LogTrackingService extends FirestoreStorage<LogTracking> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public markAsDone(uid: string, entries: MarkAsDoneEntry[]): Observable<any> {
    return from(this.firestore.firestore.runTransaction(transaction => {
      const docRef = this.firestore.firestore.doc(`${this.getBaseUri()}/${uid}`);
      return transaction.get(docRef)
        .then(doc => {
          entries
            .filter(entry => !!entry.itemId)
            .forEach(entry => {
            if (!doc.exists && entry.done) {
              const newLog = {
                crafting: [],
                gathering: []
              };
              newLog[entry.log].push(entry.itemId);
              transaction.set(docRef, newLog);
            } else {
              if (entry.done && (doc.get(entry.log) || []).indexOf(entry.itemId) === -1) {
                transaction.update(docRef, {
                  [entry.log]: firebase.firestore.FieldValue.arrayUnion(entry.itemId)
                });
              } else if (!entry.done) {
                transaction.update(docRef, {
                  [entry.log]: firebase.firestore.FieldValue.arrayRemove(entry.itemId)
                });
              }
            }
          });
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
