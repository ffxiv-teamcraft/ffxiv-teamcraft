import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Commission } from './model/commission';
import { QueryFn } from '@angular/fire/firestore/interfaces';
import { CommissionStatus } from './model/commission-status';
import { AngularFireMessaging } from '@angular/fire/messaging';

@Injectable({ providedIn: 'root' })
export class CommissionService extends FirestoreRelationalStorage<Commission> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private afm: AngularFireMessaging) {
    super(firestore, serializer, zone, pendingChangesService);
    if (navigator && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then(registration => {
        this.afm.useServiceWorker(registration);
      });
    }
  }

  private where(query: QueryFn): Observable<Commission[]> {
    return this.firestore.collection(this.getBaseUri(), query)
      .snapshotChanges()
      .pipe(
        tap(() => this.recordOperation('read')),
        map((snaps: DocumentChangeAction<Commission>[]) => {
          const elements = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: Commission = this.beforeDeserialization(<Commission>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id });
              delete snap.payload;
              return valueWithKey;
            });
          return this.serializer.deserialize<Commission>(elements, [this.getClass()]);
        }),
        map(elements => {
          return elements.map(el => {
            if ((el as any).afterDeserialized) {
              (el as any).afterDeserialized();
            }
            return el;
          });
        }),
        tap(elements => {
          elements.forEach(el => {
            this.syncCache[el.$key] = JSON.parse(JSON.stringify(el));
          });
        })
      );
  }

  public getByCrafterId(userId: string, allStatuses = false): Observable<Commission[]> {
    return this.where(ref => {
      const base = ref.where('crafterId', '==', userId);
      if (allStatuses) {
        return base;
      }
      return base.where('status', '==', CommissionStatus.OPENED);
    });
  }

  public getByDatacenter(datacenter: string, allStatuses = false): Observable<Commission[]> {
    return this.where(ref => {
      const base = ref.where('datacenter', '==', datacenter);
      if (allStatuses) {
        return base;
      }
      return base.where('status', '==', CommissionStatus.OPENED);
    });
  }

  protected getBaseUri(params?: any): string {
    return 'commissions';
  }

  protected getClass(): any {
    return Commission;
  }

}
