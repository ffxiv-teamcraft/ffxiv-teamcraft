import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Commission } from './model/commission';
import { QueryFn } from '@angular/fire/compat/firestore/interfaces';
import { CommissionStatus } from './model/commission-status';
import { CommissionTag } from './model/commission-tag';

@Injectable({ providedIn: 'root' })
export class CommissionService extends FirestoreRelationalStorage<Commission> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getByCrafterId(userId: string, archived = false): Observable<Commission[]> {
    return this.where(ref => {
      const base = ref.where('crafterId', '==', userId);
      return base.where('status', '==', archived ? CommissionStatus.ARCHIVED : CommissionStatus.IN_PROGRESS);
    });
  }

  public getByClientId(userId: string, archived = false): Observable<Commission[]> {
    return this.where(ref => {
      const base = ref.where('authorId', '==', userId);
      if (!archived) {
        return base;
      }
      return base.where('status', '==', CommissionStatus.ARCHIVED);
    });
  }

  public getByDatacenter(datacenter: string, tags: CommissionTag[], onlyCrafting: boolean, onlyMaterials: boolean, minPrice: number): Observable<Commission[]> {
    return this.where(ref => {
      let query = ref.where('datacenter', '==', datacenter);
      if (tags.length > 0) {
        query = query.where('tags', 'array-contains-any', tags);
      }
      return query.where('status', '==', CommissionStatus.OPENED);
    }).pipe(
      map(commissions => {
        return commissions.filter(c => {
          return c.price >= minPrice && (!onlyCrafting || c.includesMaterials) && (!onlyMaterials || c.requiresOnlyMaterials);
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

}
