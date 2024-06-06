import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { LogTracking } from '../../model/user/log-tracking';
import { concat, from, Observable } from 'rxjs';

import { chunk } from 'lodash';
import { arrayRemove, arrayUnion, Firestore, runTransaction } from '@angular/fire/firestore';

interface MarkAsDoneEntry {
  itemId: number;
  log: keyof Extract<LogTracking, number[]>;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class LogTrackingService extends FirestoreStorage<LogTracking> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public markAsDone(uid: string, entries: MarkAsDoneEntry[]): Observable<any> {
    return concat(chunk(entries, 450)
      .map(entriesChunk => {
        return from(runTransaction(this.firestore, async transaction => {
          const docRef = this.docRef(uid);
          try {
            const doc = await transaction.get(docRef);
            return entriesChunk
              .filter(entry => !!entry.itemId)
              .forEach(entry => {
                if (!doc.exists() && entry.done) {
                  const newLog = {
                    crafting: [],
                    gathering: []
                  };
                  newLog[entry.log].push(entry.itemId);
                  transaction.set(docRef, newLog);
                } else {
                  if (entry.done && (doc.get(entry.log.toString()) || []).indexOf(entry.itemId) === -1) {
                    transaction.update(docRef, {
                      [entry.log]: arrayUnion(entry.itemId)
                    });
                  } else if (!entry.done) {
                    transaction.update(docRef, {
                      [entry.log]: arrayRemove(entry.itemId)
                    });
                  }
                }
              });
          } catch (err) {
            return console.error(err);
          }
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
