import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { UniversalisService } from '../api/universalis.service';
import { delayWhen, distinctUntilChanged, filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { UserInventory } from '../../model/user/inventory/user-inventory';
import { combineLatest, interval, merge, Observable, of, Subject } from 'rxjs';
import { AuthFacade } from '../../+state/auth.facade';
import * as _ from 'lodash';
import { InventoryPatch } from '../../model/user/inventory/inventory-patch';
import { ListsFacade } from '../../modules/list/+state/lists.facade';
import { InventoryItem } from '../../model/user/inventory/inventory-item';
import { ContainerType } from '../../model/user/inventory/container-type';
import { InventoryFacade } from '../../modules/inventory/+state/inventory.facade';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { ofPacketType } from '../rxjs/of-packet-type';
import { territories } from '../data/sources/territories';
import { debounceBufferTime } from '../rxjs/debounce-buffer-time';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { SettingsService } from '../../modules/settings/settings.service';
import { Region } from '../../modules/settings/region.enum';
import { environment } from '../../../environments/environment';
import { LazyDataService } from '../data/lazy-data.service';
import { InventoryEventType } from '../../model/user/inventory/inventory-event-type';
import { ActorControl, EffectResult, FishingBaitMsg, InitZone, UpdateClassInfo, WeatherChange } from '../../model/pcap';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PacketCaptureTrackerService {

  private inventory$: Observable<UserInventory>;

  private _inventoryPatches$ = new Subject<InventoryPatch>();

  public inventoryPatches$ = this._inventoryPatches$.asObservable().pipe(
    shareReplay()
  );

  public readonly inventoryEvents$ = this.inventoryPatches$.pipe(
    filter(patch => !patch.moved),
    map(patch => {
      return {
        type: this.getEventType(patch),
        itemId: patch.itemId,
        amount: patch.quantity,
        containerId: patch.containerId,
        retainerName: patch.retainerName
      };
    })
  );

  private retainerInformationsSync = {};

  private retainerInformations$ = this.ipc.retainerInformationPackets$.pipe(
    map(packet => {
      this.retainerInformationsSync[packet.retainerID] = packet;
      return Object.values<any>(this.retainerInformationsSync);
    })
  );

  private retainerSpawns$: Observable<string> = combineLatest([this.retainerInformations$, this.ipc.npcSpawnPackets$, this.settings.region$]).pipe(
    map(([retainers, spawn, region]) => {
      let name: string = spawn.name;
      if ((region === Region.Korea && environment.koreanGameVersion < 5.2) || (region === Region.China && environment.chineseGameVersion < 5.2)) {
        const uint8array: Uint8Array = new TextEncoder().encode(name);
        name = new TextDecoder().decode(uint8array.slice(4));
      }
      return [retainers, name];
    }),
    filter(([retainers, name]: [any[], string]) => name.length > 0 && retainers.some(retainer => retainer.name === name)),
    map(([, name]) => {
      return name;
    }),
    distinctUntilChanged(),
    tap(name => this.ipc.log('Retainer spawn', name)),
    startWith('')
  );

  private constants: Record<'CN' | 'KR' | 'Global', Record<string, number>>;

  constructor(private ipc: IpcService, private userInventoryService: InventoryFacade,
              private universalis: UniversalisService, private authFacade: AuthFacade,
              private listsFacade: ListsFacade, private eorzeaFacade: EorzeaFacade,
              private settings: SettingsService, private lazyData: LazyDataService,
              private http: HttpClient) {
    this.http.get<Record<'CN' | 'KR' | 'Global', Record<string, number>>>('https://cdn.jsdelivr.net/gh/karashiiro/FFXIVOpcodes@latest/constants.min.json')
      .subscribe(constants => this.constants = constants);
    this.inventory$ = this.userInventoryService.inventory$.pipe(
      filter(inventory => !!inventory.contentId),
      map(inventory => inventory.clone()),
      shareReplay(1)
    );
  }

  private getInventoryTransactionFlag(): number {
    switch (this.settings.region) {
      case Region.China:
        return this.constants.CN.InventoryOperationBaseValue - 1;
      case Region.Korea:
        return this.constants.KR.InventoryOperationBaseValue - 1;
      case Region.Global:
      default:
        return this.constants.Global.InventoryOperationBaseValue - 1;
    }
  }

  public init(): void {
    const isCrafting$ = merge(
      this.ipc.packets$.pipe(ofPacketType('eventStart')),
      this.ipc.packets$.pipe(ofPacketType('eventFinish'))
    ).pipe(
      filter(packet => packet.eventId === 0xA0001),
      map(packet => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay(1)
    );

    merge(this.ipc.itemInfoPackets$, this.ipc.currencyCrystalInfoPackets$).pipe(
      filter(packet => {
        return packet.slot >= 0
          && packet.slot < 32000
          && packet.catalogId < 40000;
      }),
      debounceBufferTime(1000),
      filter(packets => packets.length > 0),
      withLatestFrom(this.retainerSpawns$, this.inventory$),
      tap(([itemInfos, lastRetainerSpawned]) => this.ipc.log('ItemInfos', itemInfos.length, lastRetainerSpawned)),
      map(([itemInfos, lastRetainerSpawned, inventory]) => {
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

        if (inventory.items[inventory.contentId]) {
          if (isRetainer) {
            Object.keys(inventory.items[inventory.contentId])
              .filter(key => key.startsWith(lastRetainerSpawned))
              .forEach(key => inventory.items[inventory.contentId][key] = {});
          }
        }

        groupedInfos.forEach(group => {
          const containerKey = isRetainer ? `${lastRetainerSpawned}:${group.containerId}` : `${group.containerId}`;
          if (!isRetainer) {
            inventory = this.resetInventoryForItemInfo(inventory, +group.containerId);
          }
          inventory.items[inventory.contentId][containerKey] = {};
          group.packets.forEach(packet => {
            const item: InventoryItem = {
              itemId: +packet.catalogId,
              containerId: +packet.containerId,
              slot: +packet.slot,
              quantity: +packet.quantity,
              hq: packet.hqFlag === 1,
              spiritBond: +packet.spiritBond,
              materias: packet.materia || []
            };
            if (isRetainer) {
              item.retainerName = lastRetainerSpawned;
            }
            inventory.items[inventory.contentId][containerKey][packet.slot] = item;
          });
        });
        return inventory;
      }),
      filter(inventory => {
        return inventory !== null;
      })
    ).subscribe((inventory: UserInventory) => {
      inventory.lastZone = Date.now();
      this.userInventoryService.updateInventory(inventory);
    });

    this.ipc.inventoryModifyHandlerPackets$.pipe(
      delayWhen(packet => {
        const fromFCChest = packet.fromContainer > 20000 && packet.fromContainer < 22000;
        const toFCChest = packet.toContainer > 20000 && packet.toContainer < 22000;
        if (fromFCChest || toFCChest) {
          return interval(1500);
        }
        return of(null);
      }),
      withLatestFrom(this.retainerSpawns$, this.inventory$),
      map(([packet, lastSpawnedRetainer, inventory]) => {
        try {
          const patch = inventory.operateTransaction(packet, lastSpawnedRetainer);
          if (patch) {
            this._inventoryPatches$.next(patch);
          }
        } catch (e) {
          console.log(packet);
          console.error(e);
          this.ipc.log(e.message, JSON.stringify(packet));
        }
        return inventory;
      })
    ).subscribe(inventory => {
      inventory.lastZone = Date.now();
      this.userInventoryService.updateInventory(inventory);
    });

    const temporaryAdditions$ = this.ipc.inventoryTransactionPackets$.pipe(
      filter(packet => packet.flag === this.getInventoryTransactionFlag())
    );

    merge(this.ipc.updateInventorySlotPackets$, temporaryAdditions$).pipe(
      filter(packet => {
        return packet.catalogId < 40000;
      }),
      debounceBufferTime(500),
      withLatestFrom(this.retainerSpawns$, this.inventory$),
      map(([packets, lastSpawnedRetainer, inventory]) => {
        packets.forEach(packet => {
          const patch = inventory.updateInventorySlot(packet, lastSpawnedRetainer);
          if (patch) {
            this._inventoryPatches$.next(patch);
          }
        });
        return inventory;
      })
    ).subscribe(inventory => {
      inventory.lastZone = Date.now();
      this.userInventoryService.updateInventory(inventory);
    });

    this.inventoryPatches$
      .pipe(
        filter(patch => {
          return patch.containerId < 10
            || patch.containerId === ContainerType.Crystal
            || (patch.containerId >= ContainerType.ArmoryOff && patch.containerId <= ContainerType.ArmoryMain);
        }),
        withLatestFrom(isCrafting$),
        filter(([patch, isCrafting]) => {
          return (patch.containerId < ContainerType.ArmoryOff || patch.containerId > ContainerType.ArmoryMain)
            || isCrafting;
        }),
        map(([patch]) => patch),
        withLatestFrom(this.listsFacade.autocompleteEnabled$, this.listsFacade.selectedList$),
        filter(([patch, autocompleteEnabled]) => {
          return autocompleteEnabled && patch.quantity > 0;
        })
      )
      .subscribe(([patch, , list]) => {
        const itemsEntry = list.items.find(i => i.id === patch.itemId);
        const finalItemsEntry = list.finalItems.find(i => i.id === patch.itemId);
        if (itemsEntry && itemsEntry.done < itemsEntry.amount) {
          this.listsFacade.setItemDone(patch.itemId, itemsEntry.icon, false, patch.quantity, itemsEntry.recipeId, itemsEntry.amount, false, true, patch.hq);
        } else if (finalItemsEntry && finalItemsEntry.done < finalItemsEntry.amount) {
          this.listsFacade.setItemDone(patch.itemId, finalItemsEntry.icon, true, patch.quantity, finalItemsEntry.recipeId, finalItemsEntry.amount, false, true, patch.hq);
        }
      });

    combineLatest([
      this.ipc.packets$.pipe(
        ofPacketType<InitZone>('initZone')
      ),
      this.lazyData.data$
    ]).subscribe(([packet, data]) => {
      const mapId = territories[packet.zoneID.toString()];
      this.eorzeaFacade.setZone(this.lazyData.data.maps[mapId].placename_id);
      this.eorzeaFacade.setPcapWeather(packet.weatherID, true);
      this.eorzeaFacade.setMap(mapId);
    });

    this.ipc.packets$.pipe(
      ofPacketType<WeatherChange>('weatherChange')
    ).subscribe(packet => {
      this.eorzeaFacade.setPcapWeather(packet.weatherID);
    });

    this.ipc.packets$.pipe(
      ofPacketSubType<FishingBaitMsg>('fishingBaitMsg')
    ).subscribe(packet => {
      if (this.lazyData.data.baitItems.includes(packet.baitID)) {
        this.eorzeaFacade.setBait(packet.baitID);
      }
    });

    this.ipc.packets$.pipe(
      ofPacketSubType<ActorControl>('statusEffectLose'),
      filter(packet => packet.sourceActorSessionID === packet.targetActorSessionID)
    ).subscribe(packet => {
      this.eorzeaFacade.removeStatus(packet.param1);
    });

    this.ipc.packets$.pipe(
      ofPacketType<ActorControl>('actorControl'),
      filter(packet => packet.category === 21 && packet.sourceActorSessionID === packet.targetActorSessionID)
    ).subscribe(packet => {
      this.eorzeaFacade.removeStatus(packet.param1);
    });

    this.ipc.packets$.pipe(
      ofPacketType<UpdateClassInfo>('updateClassInfo'),
      distinctUntilChanged((a, b) => a.classId === b.classId)
    ).subscribe(packet => {
      this.eorzeaFacade.resetStatuses();
    });

    this.ipc.packets$.pipe(
      ofPacketType('addStatusEffect')
    ).subscribe(packet => {
      // TODO use packet struct once moved to pcap-ffxiv
      const statusId = Buffer.from(packet.data).readUInt16LE(0x1A);
      this.eorzeaFacade.addStatus(statusId);
    });

    this.ipc.packets$.pipe(
      ofPacketType<EffectResult>('effectResult'),
      filter(packet => {
        return packet.sourceActorSessionID === packet.targetActorSessionID;
      })
    ).subscribe(packet => {
      for (let i = 0; i < packet.entryCount; i++) {
        if (packet.statusEntries[i].sourceActorID === packet.actorID) {
          this.eorzeaFacade.addStatus(packet.statusEntries[i].id);
        }
      }
    });

    this.ipc.packets$.pipe(
      ofPacketType('logout')
    ).subscribe(() => {
      this.userInventoryService.setContentId(null);
    });

    this.ipc.playerSetupPackets$.subscribe((packet) => {
      this.userInventoryService.setContentId(BigInt(packet.contentID).toString(16).padStart(16, '0').toUpperCase());
    });
  }

  private resetInventoryForItemInfo(inventory: UserInventory, containerKey: number): UserInventory {
    const itemsClone = JSON.parse(JSON.stringify(inventory.items[inventory.contentId]));
    if (containerKey >= ContainerType.FreeCompanyBag0 && containerKey <= ContainerType.FreeCompanyBag10) {
      itemsClone[containerKey] = {};
    } else if (containerKey % 1000 === 0) {
      Object.keys(itemsClone)
        .forEach(key => {
          if (key.indexOf(':') === -1 && Math.floor(+key / 1000) === Math.floor(containerKey / 1000)) {
            itemsClone[key] = {};
          }
        });
    }
    inventory.items[inventory.contentId] = itemsClone;
    return inventory;
  }

  private getEventType(patch: InventoryPatch): InventoryEventType {
    if (patch.quantity > 0) {
      return InventoryEventType.ADDED;
    } else if (patch.moved) {
      return InventoryEventType.MOVED;
    } else {
      return InventoryEventType.REMOVED;
    }
  }
}
