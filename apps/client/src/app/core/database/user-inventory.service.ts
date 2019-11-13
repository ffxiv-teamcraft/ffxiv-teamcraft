import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { UserInventory } from '../../model/user/inventory/user-inventory';
import { Observable, of } from 'rxjs';
import { compare, getValueByPointer } from 'fast-json-patch';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class UserInventoryService extends FirestoreStorage<UserInventory> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService,
              private fns: AngularFireFunctions) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  update(uid: string, data: Partial<UserInventory>, uriParams?: any): Observable<void> {
    const diff = compare(this.syncCache[uid], data)
      .map(entry => {
        if (entry.op === 'replace' && typeof entry.value === 'number') {
          return {
            ...entry,
            offset: getValueByPointer(data, entry.path) - getValueByPointer(this.syncCache[uid], entry.path),
            custom: true
          };
        }
        return entry;
      });
    this.zone.runOutsideAngular(() => {
      this.fns.httpsCallable('updateInventory')(
        {
          diff: diff,
          uid: uid
        }
      );
    });
    return of(null);
  }

  protected getBaseUri(): string {
    return '/user-inventories';
  }

  protected getClass(): any {
    return UserInventory;
  }

}
