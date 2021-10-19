import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { LogTracking } from '../../model/user/log-tracking';
import { concat, from, Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { chunk } from 'lodash';

interface MarkAsDoneEntry {
  itemId: number;
  log: keyof Extract<LogTracking, number[]>;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class LogTrackingService extends FirestoreStorage<LogTracking> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public markAsDone(uid: string, entries: MarkAsDoneEntry[]): Observable<any> {
    return concat(chunk(entries, 450)
      .map(entriesChunk => {
        return from(this.firestore.firestore.runTransaction(transaction => {
          const docRef = this.firestore.firestore.doc(`${this.getBaseUri()}/${uid}`);
          return transaction.get(docRef)
            .then(doc => {
              entriesChunk
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
                    if (entry.done && (doc.get(entry.log.toString()) || []).indexOf(entry.itemId) === -1) {
                      transaction.update(docRef, {
                        [entry.log]: firebase.firestore.FieldValue.arrayUnion(entry.itemId)
                      });
                    } else if (!entry.done) {
                      transaction.update(docRef, {
                        [entry.log]: firebase.firestore.FieldValue.arrayRemove(entry.itemId)
                      });
                    } else {
                      Promise.resolve();
                    }
                  }
                });
            });
        }));
      })
    );
  }

  protected getBaseUri(): string {
    return '/log-tracking';
  }

  protected getClass(): any {
    return LogTracking;
  }

}
