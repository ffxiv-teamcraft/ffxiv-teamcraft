import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { UserInventory } from '../../model/user/inventory/user-inventory';
import { AuthFacade } from '../../+state/auth.facade';
import { Observable } from 'rxjs';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { debounceTime, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ContainerType } from '../../model/user/inventory/container-type';
import { diff } from 'deep-diff';

@Injectable({
  providedIn: 'root'
})
export class UserInventoryService extends FirestoreRelationalStorage<UserInventory> {

  private userInventory$ = this.authFacade.user$.pipe(
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
    }),
    debounceTime(200),
    shareReplay(1)
  );

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private authFacade: AuthFacade) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getContainerName(containerId: number): string {
    switch (containerId) {
      case ContainerType.Bag0:
      case ContainerType.Bag1:
      case ContainerType.Bag2:
      case ContainerType.Bag3:
        return 'Bag';
      case ContainerType.RetainerBag0:
      case ContainerType.RetainerBag1:
      case ContainerType.RetainerBag2:
      case ContainerType.RetainerBag3:
      case ContainerType.RetainerBag4:
      case ContainerType.RetainerBag5:
      case ContainerType.RetainerBag6:
        return 'RetainerBag';
      case ContainerType.SaddleBag0:
      case ContainerType.SaddleBag1:
        return 'SaddleBag';
    }
    return 'Other';
  }

  update(uid: string, data: Partial<UserInventory>, uriParams?: any): Observable<void> {
    const changes = (diff(this.syncCache[uid], data) || []);
    if (changes.some(entry => entry.kind === 'D' || entry.kind === 'A')) {
      return super.update(uid, data, uriParams);
    }
    const patch = changes.reduce((res, change) => {
      res[change.path.join('.')] = change.rhs;
      return res;
    }, {});
    return super.update(uid, patch, uriParams);
  }

  public getUserInventory(): Observable<UserInventory> {
    return this.userInventory$;
  }

  protected getBaseUri(): string {
    return '/user-inventories';
  }

  protected getClass(): any {
    return UserInventory;
  }

}
