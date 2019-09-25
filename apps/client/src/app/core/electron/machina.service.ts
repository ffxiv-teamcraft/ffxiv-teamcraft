import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { UserInventoryService } from '../database/user-inventory.service';
import { UniversalisService } from '../api/universalis.service';
import {
  buffer,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';
import { UserInventory } from '../../model/user/inventory/user-inventory';
import { combineLatest, Observable, Subject } from 'rxjs';
import { AuthFacade } from '../../+state/auth.facade';
import * as _ from 'lodash';
import { InventoryPatch } from '../../model/user/inventory/inventory-patch';
import { ListsFacade } from '../../modules/list/+state/lists.facade';
import { InventoryItem } from '../../model/user/inventory/inventory-item';

@Injectable({
  providedIn: 'root'
})
export class MachinaService {

  private inventory$: Observable<UserInventory>;

  private _inventoryPatches$ = new Subject<InventoryPatch>();

  public get inventoryPatches$(): Observable<InventoryPatch> {
    return this._inventoryPatches$.asObservable();
  }

  private retainerSpawns$: Observable<string> = this.ipc.npcSpawnPackets$.pipe(
    filter(spawn => spawn.modelType === 0x0A),
    map(spawn => spawn.name),
    startWith(null)
  );

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
      filter(packet => {
        return packet.slot >= 0
          && packet.slot < 32000
          && packet.catalogId < 40000
          && (packet.hqFlag === 0 || packet.hqFlag === 1);
      }),
      buffer(this.ipc.itemInfoPackets$.pipe(debounceTime(1000))),
      filter(packets => packets.length > 0),
      withLatestFrom(this.retainerSpawns$),
      switchMap(([itemInfos, lastRetainerSpawned]) => {
        return this.inventory$.pipe(
          first(),
          map((inventory) => {
            const updatedContainerIds = _.uniqBy(itemInfos, 'containerId').map(packet => packet.containerId);
            const isRetainer = updatedContainerIds.some(id => id > 9999 && id < 20000);
            inventory.items = [
              ...inventory.items.filter(i => {
                if (isRetainer) {
                  return i.retainerName !== lastRetainerSpawned;
                }
                return updatedContainerIds.indexOf(i.containerId) === -1;
              }),
              ..._.uniqBy(itemInfos, (packet => `${packet.slot}${packet.containerId}`))
                .map(itemInfo => {
                  const item: InventoryItem = {
                    itemId: +itemInfo.catalogId,
                    containerId: +itemInfo.containerId,
                    slot: +itemInfo.slot,
                    quantity: +itemInfo.quantity,
                    hq: itemInfo.hqFlag === 1
                  };
                  if (isRetainer) {
                    item.retainerName = lastRetainerSpawned;
                  }
                  return item;
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

    this.ipc.inventoryModifyHandlerPackets$.pipe(
      withLatestFrom(this.retainerSpawns$),
      switchMap(([packet, lastSpawnedRetainer]) => {
        return this.inventory$.pipe(
          first(),
          map(inventory => {
            const patch = inventory.operateTransaction(packet, lastSpawnedRetainer);
            if (patch) {
              this._inventoryPatches$.next(patch);
            }
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
      filter(packet => {
        return packet.quantity > 0 && packet.catalogId < 40000;
      }),
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
        filter(patch => patch.containerId < 10),
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
