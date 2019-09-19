import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { UserInventory } from '../../model/user/inventory/user-inventory';
import { AuthFacade } from '../../+state/auth.facade';
import { Observable } from 'rxjs';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserInventoryService extends FirestoreRelationalStorage<UserInventory> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private authFacade: AuthFacade) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getUserInventory(): Observable<UserInventory> {
    return this.authFacade.user$.pipe(
      switchMap(user => {
        return this.getByForeignKey(TeamcraftUser, user.$key).pipe(
          map((inventories: UserInventory[]) => {
            if (user.defaultLodestoneId) {
              return inventories.find(inventory => inventory.characterId === user.defaultLodestoneId);
            }
            return inventories[0];
          }),
          map(inventory => {
            if (inventory === undefined) {
              const newInventory = new UserInventory();
              newInventory.authorId = user.$key;
              newInventory.characterId = user.defaultLodestoneId;
              return newInventory;
            }
            return inventory;
          })
        );
      }));
  }

  protected getBaseUri(): string {
    return '/user-inventories';
  }

  protected getClass(): any {
    return UserInventory;
  }

}
