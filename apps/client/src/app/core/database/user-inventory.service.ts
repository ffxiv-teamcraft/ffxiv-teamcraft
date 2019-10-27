import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { UserInventory } from '../../model/user/inventory/user-inventory';
import { AuthFacade } from '../../+state/auth.facade';
import { Observable } from 'rxjs';
import { diff } from 'deep-diff';

@Injectable({
  providedIn: 'root'
})
export class UserInventoryService extends FirestoreStorage<UserInventory> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private authFacade: AuthFacade) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  update(uid: string, data: Partial<UserInventory>, uriParams?: any): Observable<void> {
    const changes = (diff(this.syncCache[uid], data) || []);
    if (changes.some(entry => entry.kind === 'D' || entry.kind === 'A')) {
      return super.update(uid, data, uriParams);
    }
    try {
      const patch = changes
        .filter(change => change !== undefined)
        .reduce((res, change) => {
          res[change.path.join('.')] = change.rhs;
          return res;
        }, {});
      return super.update(uid, patch, uriParams);
    } catch (error) {
      return super.set(uid, data as UserInventory, uriParams);
    }
  }

  protected getBaseUri(): string {
    return '/user-inventories';
  }

  protected getClass(): any {
    return UserInventory;
  }

}
