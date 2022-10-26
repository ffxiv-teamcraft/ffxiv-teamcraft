import { FirestoreRelationalStorage } from '../../core/database/storage/firestore/firestore-relational-storage';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Injectable, NgZone } from '@angular/core';
import { PendingChangesService } from '../../core/database/pending-changes/pending-changes.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Commission } from './model/commission';
import { CommissionStatus } from './model/commission-status';
import { CommissionTag } from './model/commission-tag';
import { Firestore, QueryConstraint, where } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class CommissionService extends FirestoreRelationalStorage<Commission> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getByCrafterId(userId: string, archived = false): Observable<Commission[]> {
    return this.where(
      where('crafterId', '==', userId),
      where('status', '==', archived ? CommissionStatus.ARCHIVED : CommissionStatus.IN_PROGRESS)
    );
  }

  public getByClientId(userId: string, archived = false): Observable<Commission[]> {
    return this.where(...(archived ? [where('authorId', '==', userId), where('status', '==', CommissionStatus.ARCHIVED)] : [where('authorId', '==', userId)]));
  }

  public getByDatacenter(datacenter: string, tags: CommissionTag[], onlyCrafting: boolean, onlyMaterials: boolean, minPrice: number): Observable<Commission[]> {
    const query = [
      where('datacenter', '==', datacenter),
      tags.length > 0 ? where('tags', 'array-contains-any', tags) : null,
      where('status', '==', CommissionStatus.OPENED)
    ].filter(q => q !== null);
    return this.where(...query).pipe(
      map(commissions => {
        return commissions.filter(c => {
          return c.price >= minPrice && (!onlyCrafting || c.includesMaterials) && (!onlyMaterials || c.requiresOnlyMaterials);
        });
      })
    );
  }

  protected getBaseUri(): string {
    return 'commissions';
  }

  protected getClass(): any {
    return Commission;
  }

  private where(...query: QueryConstraint[]): Observable<Commission[]> {
    return this.query(...query)
      .pipe(
        tap(() => this.recordOperation('read'))
      );
  }

}
