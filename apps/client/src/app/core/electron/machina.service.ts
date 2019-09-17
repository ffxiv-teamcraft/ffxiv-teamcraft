import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { UserInventoryService } from '../database/user-inventory.service';
import { UniversalisService } from '../api/universalis.service';
import {
  bufferTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';
import { UserInventory } from '../../model/user/user-inventory';
import { combineLatest, Observable, Subject } from 'rxjs';
import { AuthFacade } from '../../+state/auth.facade';
import * as _ from 'lodash';
import { InventoryPatch } from '../../model/user/inventory-patch';
import { ListsFacade } from '../../modules/list/+state/lists.facade';

@Injectable({
  providedIn: 'root'
})
export class MachinaService {

  private inventory$: Observable<UserInventory>;

  private _inventoryPatches$ = new Subject<InventoryPatch>();

  public get inventoryPatches$(): Observable<InventoryPatch> {
    return this._inventoryPatches$.asObservable();
  }

  constructor(private ipc: IpcService, private userInventoryService: UserInventoryService,
              private universalis: UniversalisService, private authFacade: AuthFacade,
              private listsFacade: ListsFacade) {
    this.inventory$ = combineLatest([this.userInventoryService.getUserInventory(), this.authFacade.user$]).pipe(
      map(([inventory, user]) => {
        if (!inventory) {
          inventory = new UserInventory();
          if (user.defaultLodestoneId) {
            inventory.characterId = user.defaultLodestoneId;
          }
          inventory.authorId = user.$key;
        }
        return inventory;
      }),
      distinctUntilChanged((a, b) => {
        return JSON.stringify(a.items) === JSON.stringify(b.items);
      }),
      shareReplay(1)
    );
  }

  public init(): void {
    this.ipc.itemInfoPackets$.pipe(
      bufferTime(500),
      filter(packets => packets.length > 0),
      switchMap(itemInfos => {
        return this.inventory$.pipe(
          first(),
          map((inventory) => {
            const updatedContainerIds = _.uniqBy(itemInfos, 'containerId').map(packet => packet.containerId);
            inventory.items = [
              ...inventory.items.filter(i => updatedContainerIds.indexOf(i.containerId) < 0),
              ...itemInfos.map(itemInfo => {
                return {
                  itemId: +itemInfo.catalogId,
                  containerId: +itemInfo.containerId,
                  slot: +itemInfo.slot,
                  quantity: +itemInfo.quantity,
                  hq: itemInfo.hq === 1
                };
              })];
            return inventory;
          })
        );
      }),
      switchMap(inventory => {
        if (inventory.$key) {
          return this.userInventoryService.set(inventory.$key, inventory);
        } else {
          return this.userInventoryService.add(inventory);
        }
      })
    ).subscribe();

    this.ipc.updateInventorySlotPackets$.pipe(
      switchMap((packet) => {
        return this.inventory$.pipe(
          first(),
          map(inventory => {
            const patch = inventory.updateInventorySlot(packet);
            this._inventoryPatches$.next(patch);
            return inventory;
          })
        );
      }),
      switchMap(inventory => {
        if (inventory.$key) {
          return this.userInventoryService.set(inventory.$key, inventory);
        } else {
          return this.userInventoryService.add(inventory);
        }
      })
    ).subscribe();

    this.inventoryPatches$
      .pipe(
        withLatestFrom(this.listsFacade.autocompleteEnabled$, this.listsFacade.selectedList$),
        filter(([patch, autocompleteEnabled]) => autocompleteEnabled && patch.quantity > 0)
      )
      .subscribe(([patch, , list]) => {
        const itemsEntry = list.items.find(i => i.id === patch.itemId);
        const finalItemsEntry = list.finalItems.find(i => i.id === patch.itemId);
        if (itemsEntry && itemsEntry.done < itemsEntry.amount) {
          this.listsFacade.setItemDone(patch.itemId, itemsEntry.icon, false, patch.quantity, itemsEntry.recipeId, itemsEntry.amount);
        } else if (!itemsEntry && finalItemsEntry && finalItemsEntry.done < finalItemsEntry.amount) {
          this.listsFacade.setItemDone(patch.itemId, finalItemsEntry.icon, true, patch.quantity, finalItemsEntry.recipeId, finalItemsEntry.amount);
        }
      });
  }
}
