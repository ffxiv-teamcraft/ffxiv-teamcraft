import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Commission } from './model/commission';

@Injectable({ providedIn: 'root' })
export class CommissionService extends FirestoreRelationalStorage<Commission> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getByCrafterId(userId: string): Observable<Commission[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('crafterId', '==', userId))
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

  protected getBaseUri(params?: any): string {
    return 'commissions';
  }

  protected getClass(): any {
    return Commission;
  }

}
