import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { PersistedFishTrain } from '../../model/other/persisted-fish-train';
import { Injectable, NgZone } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, query, writeBatch } from '@angular/fire/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { TrainFishingReport } from '../data-reporting/fishing-report';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FishTrainService extends FirestoreStorage<PersistedFishTrain> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  addReport(report: TrainFishingReport): Observable<void> {
    const collectionRef = collection(this.firestore, this.getBaseUri(), report.trainId, 'reports');
    return from(addDoc(collectionRef, report)).pipe(
      map(() => void 0)
    );
  }

  addReports(trainId: string, reports: TrainFishingReport[]): Observable<void> {
    if (reports.length === 0) {
      return of(void 0);
    }
    const collectionRef = collection(this.firestore, this.getBaseUri(), trainId, 'reports');
    const batches = new Array(Math.ceil(reports.length / 450)).fill(null).map(() => writeBatch(this.firestore));
    reports.forEach((report, index) => {
      batches[Math.floor(index / 450)].set(doc(collectionRef), report);
    });
    return from(Promise.all(batches.map(batch => batch.commit()))).pipe(
      map(() => void 0)
    );
  }

  override get(key: string): Observable<PersistedFishTrain> {
    return super.get(key, true).pipe(
      switchMap(train => {
        return this.getReports(train.$key).pipe(
          map(reports => {
            train.reports = reports;
            return train;
          })
        );
      })
    );
  }

  getReports(id: string): Observable<TrainFishingReport[]> {
    const collectionRef = collection(this.firestore, this.getBaseUri(), id, 'reports');
    return collectionData(query(collectionRef)).pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    ) as Observable<TrainFishingReport[]>;
  }

  protected getBaseUri(): string {
    return 'fish-train';
  }

  protected getClass(): any {
    return PersistedFishTrain;
  }

}
