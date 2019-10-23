import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { UniversalisService } from '../api/universalis.service';
import {
  buffer,
  debounceTime,
  delayWhen,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { UserInventory } from '../../model/user/inventory/user-inventory';
import { interval, merge, Observable, of, Subject } from 'rxjs';
import { AuthFacade } from '../../+state/auth.facade';
import * as _ from 'lodash';
import { InventoryPatch } from '../../model/user/inventory/inventory-patch';
import { ListsFacade } from '../../modules/list/+state/lists.facade';
import { InventoryItem } from '../../model/user/inventory/inventory-item';
import { ContainerType } from '../../model/user/inventory/container-type';
import { InventoryFacade } from '../../modules/inventory/+state/inventory.facade';

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
    tap(name => this.ipc.log('Retainer spawn', name)),
    startWith('')
  );

  constructor(private ipc: IpcService, private userInventoryService: InventoryFacade,
              private universalis: UniversalisService, private authFacade: AuthFacade,
              private listsFacade: ListsFacade) {
    this.inventory$ = this.userInventoryService.inventory$.pipe(
      distinctUntilChanged((a, b) => {
        return _.isEqual(a, b);
      }),
      map(inventory => inventory.clone()),
      shareReplay(1)
    );
  }

  public init(): void {
    merge(this.ipc.itemInfoPackets$, this.ipc.currencyCrystalInfoPackets$).pipe(
      filter(packet => {
        return packet.slot >= 0
          && packet.slot < 32000
          && packet.catalogId < 40000;
      }),
      buffer(this.ipc.itemInfoPackets$.pipe(debounceTime(1000))),
      filter(packets => packets.length > 0),
      withLatestFrom(this.retainerSpawns$),
      tap(([itemInfos, lastRetainerSpawned]) => this.ipc.log('ItemInfos', itemInfos.length, lastRetainerSpawned)),
      switchMap(([itemInfos, lastRetainerSpawned]) => {
        return this.inventory$.pipe(
          first(),
          map((inventory) => {
            const updatedContainerIds = _.uniqBy(itemInfos, 'containerId').map(packet => packet.containerId);
            const isRetainer = updatedContainerIds.some(id => id >= 10000 && id < 20000);
            if (isRetainer && !lastRetainerSpawned) {
              return null;
            }
            const groupedInfos = _.chain(itemInfos)
              .groupBy('containerId')
              .map((packets, containerId) => {
                return {
                  containerId: containerId,
                  packets: packets
                };
              })
              .value();
            groupedInfos.forEach(group => {
              const containerKey = isRetainer ? `${lastRetainerSpawned}:${group.containerId}` : `${group.containerId}`;
              inventory.items[containerKey] = {};
              group.packets.forEach(packet => {
                const item: InventoryItem = {
                  itemId: +packet.catalogId,
                  containerId: +packet.containerId,
                  slot: +packet.slot,
                  quantity: +packet.quantity,
                  hq: packet.hqFlag === 1,
                  spiritBond: +packet.spiritBond
                };
                if (isRetainer) {
                  item.retainerName = lastRetainerSpawned;
                }
                inventory.items[containerKey][packet.slot] = item;
              });
            });
            return inventory;
          })
        );
      }),
      filter(inventory => {
        return inventory !== null;
      })
    ).subscribe(inventory => {
      inventory.lastZone = Date.now();
      this.userInventoryService.updateInventory(inventory);
    });

    this.ipc.inventoryModifyHandlerPackets$.pipe(
      delayWhen(packet => {
        const fromFCChest = [ContainerType.FreeCompanyBag0,
          ContainerType.FreeCompanyBag1,
          ContainerType.FreeCompanyBag2].indexOf(packet.fromContainer) > -1;
        const toFCChest = [ContainerType.FreeCompanyBag0,
          ContainerType.FreeCompanyBag1,
          ContainerType.FreeCompanyBag2].indexOf(packet.toContainer) > -1;
        if (fromFCChest || toFCChest) {
          return interval(1500);
        }
        return of(null);
      }),
      withLatestFrom(this.retainerSpawns$),
      switchMap(([packet, lastSpawnedRetainer]) => {
        return this.inventory$.pipe(
          first(),
          map(inventory => {
            try {
              const patch = inventory.operateTransaction(packet, lastSpawnedRetainer);
              if (patch) {
                this._inventoryPatches$.next(patch);
              }
            } catch (e) {
              console.log(packet);
              console.error(e);
            }
            return inventory;
          })
        );
      })
    ).subscribe(inventory => {
      inventory.lastZone = Date.now();
      this.userInventoryService.updateInventory(inventory);
    });

    this.ipc.updateInventorySlotPackets$.pipe(
      filter(packet => {
        return packet.catalogId < 40000;
      }),
      withLatestFrom(this.retainerSpawns$),
      switchMap(([packet, lastRetainerSpawned]) => {
        return this.inventory$.pipe(
          first(),
          map(inventory => {
            const patch = inventory.updateInventorySlot(packet, lastRetainerSpawned);
            if (patch) {
              this._inventoryPatches$.next(patch);
            }
            return inventory;
          })
        );
      })
    ).subscribe(inventory => {
      inventory.lastZone = Date.now();
      this.userInventoryService.updateInventory(inventory);
    });

    this.inventoryPatches$
      .pipe(
        filter(patch => patch.containerId < 10 || patch.containerId === ContainerType.Crystal),
        withLatestFrom(this.listsFacade.autocompleteEnabled$, this.listsFacade.selectedList$),
        filter(([patch, autocompleteEnabled]) => autocompleteEnabled && patch.quantity > 0)
      )
      .subscribe(([patch, , list]) => {
        const itemsEntry = list.items.find(i => i.id === patch.itemId);
        const finalItemsEntry = list.finalItems.find(i => i.id === patch.itemId);
        if (itemsEntry && itemsEntry.done < itemsEntry.amount) {
          this.listsFacade.setItemDone(patch.itemId, itemsEntry.icon, false, patch.quantity, itemsEntry.recipeId, itemsEntry.amount, false, true);
        } else if (!itemsEntry && finalItemsEntry && finalItemsEntry.done < finalItemsEntry.amount) {
          this.listsFacade.setItemDone(patch.itemId, finalItemsEntry.icon, true, patch.quantity, finalItemsEntry.recipeId, finalItemsEntry.amount, false, true);
        }
      });
  }
}
