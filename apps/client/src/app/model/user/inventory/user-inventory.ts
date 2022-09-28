import { InventoryItem } from './inventory-item';
import { InventoryPatch } from './inventory-patch';
import { DataModel } from '../../../core/database/storage/data-model';
import { ContainerType } from './container-type';
import { CharacterInventory } from './character-inventory';
import { ItemSearchResult } from './item-search-result';
import { ClientTrigger, InventoryModifyHandler, InventoryTransaction, ItemMarketBoardInfo, UpdateInventorySlot } from '@ffxiv-teamcraft/pcap-ffxiv';
import { uniqBy } from 'lodash';

export class UserInventory extends DataModel {

  public static readonly DISPLAYED_CONTAINERS = [
    ContainerType.Crystal,
    ContainerType.Bag0,
    ContainerType.Bag1,
    ContainerType.Bag2,
    ContainerType.Bag3,
    ContainerType.RetainerBag0,
    ContainerType.RetainerBag1,
    ContainerType.RetainerBag2,
    ContainerType.RetainerBag3,
    ContainerType.RetainerBag4,
    ContainerType.RetainerBag5,
    ContainerType.RetainerBag6,
    ContainerType.SaddleBag0,
    ContainerType.SaddleBag1,
    ContainerType.PremiumSaddleBag0,
    ContainerType.PremiumSaddleBag1,
    ContainerType.FreeCompanyBag0,
    ContainerType.FreeCompanyBag1,
    ContainerType.FreeCompanyBag2,
    ContainerType.FreeCompanyBag3,
    ContainerType.FreeCompanyBag4,
    ContainerType.FreeCompanyBag5,
    ContainerType.FreeCompanyBag6,
    ContainerType.FreeCompanyBag7,
    ContainerType.FreeCompanyBag8,
    ContainerType.FreeCompanyBag9,
    ContainerType.FreeCompanyBag10,
    ContainerType.ArmoryOff,
    ContainerType.ArmoryHead,
    ContainerType.ArmoryBody,
    ContainerType.ArmoryHand,
    ContainerType.ArmoryWaist,
    ContainerType.ArmoryLegs,
    ContainerType.ArmoryFeet,
    ContainerType.ArmoryNeck,
    ContainerType.ArmoryEar,
    ContainerType.ArmoryWrist,
    ContainerType.ArmoryRing,
    ContainerType.ArmorySoulCrystal,
    ContainerType.ArmoryMain,
    ContainerType.RetainerMarket,
    ContainerType.GearSet0,
    ContainerType.IslandSanctuaryBag
  ];

  items: { [contentId: string]: CharacterInventory } = {};

  _containers: ItemSearchResult[] = [];

  lastZone: number;

  private searchCache: ItemSearchResult[] = [];

  private _contentId?: string;

  public get contentId(): string {
    return this._contentId;
  }

  public set contentId(contentId: string) {
    this._contentId = contentId;
    if (!this.items[contentId] && contentId) {
      this.items[contentId] = {};
    }
    this.resetSearchCache();
  }

  get trackItemsOnSale(): boolean {
    return localStorage.getItem('trackItemsOnSale') === 'true';
  }

  getContainers() {
    this.generateSearchCacheIfNeeded();
    return this._containers;
  }

  hasItem(itemId: number, onlyCurrentCharacter = false, onlyUserInventory = false): boolean {
    this.generateSearchCacheIfNeeded();
    return this.searchCache.some(item => {
      return (!onlyCurrentCharacter || item.contentId === this.contentId)
        && (!onlyUserInventory || item.containerId < 10)
        && item.itemId === itemId;
    });
  }

  getItem(itemId: number, onlyUserInventory = false): ItemSearchResult[] {
    this.generateSearchCacheIfNeeded();
    return this.searchCache.filter(item => (!onlyUserInventory || (item.containerId < 10 && item.contentId === this.contentId)) && item.itemId === itemId);
  }

  getRetainerGear(retainerName: string): ItemSearchResult[] {
    this.generateSearchCacheIfNeeded();
    return this.searchCache.filter(item => {
      return item.containerId === ContainerType.RetainerEquippedGear && item.retainerName === retainerName;
    });
  }

  updateInventorySlot(packet: UpdateInventorySlot | InventoryTransaction, lastSpawnedRetainer: string): InventoryPatch | null {
    this.resetSearchCache();
    if (!this.items[this.contentId]) {
      return null;
    }
    const isRetainer = packet.containerId >= 10000 && packet.containerId < 20000;
    const containerKey = isRetainer ? `${lastSpawnedRetainer}:${packet.containerId}` : `${packet.containerId}`;
    if (this.items[this.contentId][containerKey] === undefined) {
      return null;
    }
    let item = this.items[this.contentId][containerKey][packet.slot];
    const previousQuantity = item ? item.quantity : 0;
    if (packet.quantity === 0 && packet.catalogId === 0) {
      delete this.items[this.contentId][containerKey][packet.slot];
      if (item !== undefined) {
        return {
          itemId: item.itemId,
          quantity: -1 * item.quantity,
          containerId: packet.containerId,
          hq: item.hq,
          spiritBond: item.spiritBond,
          retainerName: isRetainer ? lastSpawnedRetainer : null
        };
      }
      return null;
    }
    // Happens if you add an item that you never had in your inventory before (in an empty slot)
    if ((item === undefined || item.itemId !== packet.catalogId) && packet.quantity > 0) {
      const entry: InventoryItem = {
        itemId: packet.catalogId,
        quantity: packet.quantity,
        hq: (packet as UpdateInventorySlot).hqFlag || false,
        slot: packet.slot,
        containerId: packet.containerId,
        spiritBond: +(packet as UpdateInventorySlot).spiritBond || 0,
        retainerName: isRetainer ? lastSpawnedRetainer : null,
        materias: (packet as UpdateInventorySlot).materia || []
      };
      if (isRetainer) {
        entry.retainerName = lastSpawnedRetainer;
      }
      this.items[this.contentId][containerKey][packet.slot] = entry;
      item = this.items[this.contentId][containerKey][packet.slot];
    }
    item.quantity = packet.quantity;
    item.hq = (packet as UpdateInventorySlot).hqFlag;
    if (packet.quantity - previousQuantity !== 0) {
      return {
        itemId: packet.catalogId,
        quantity: packet.quantity - previousQuantity,
        containerId: packet.containerId,
        hq: (packet as UpdateInventorySlot).hqFlag,
        retainerName: isRetainer ? lastSpawnedRetainer : null
      };
    }
    return null;
  }

  operateTransaction(packet: InventoryModifyHandler, lastSpawnedRetainer: string): InventoryPatch | null {
    this.resetSearchCache();
    if (!this.items[this.contentId]) {
      return null;
    }
    const isFromRetainer = packet.fromContainer >= 10000 && packet.fromContainer < 20000;
    const isToRetainer = packet.toContainer >= 10000 && packet.toContainer < 20000;
    const fromContainerKey = isFromRetainer ? `${lastSpawnedRetainer}:${packet.fromContainer}` : `${packet.fromContainer}`;
    const toContainerKey = isToRetainer ? `${lastSpawnedRetainer}:${packet.toContainer}` : `${packet.toContainer}`;

    const fromContainer = this.items[this.contentId][fromContainerKey];
    if (fromContainer === undefined) {
      return null;
    }
    let toContainer = this.items[this.contentId][toContainerKey];
    if (toContainer === undefined) {
      this.items[this.contentId][toContainerKey] = {};
      toContainer = this.items[this.contentId][toContainerKey];
    }
    if (toContainer === undefined && packet.action === 'merge') {
      console.warn('Tried to move an item to an inexisting container', JSON.stringify(packet));
      return null;
    }

    const fromItem = fromContainer[packet.fromSlot];
    const toItem = toContainer[packet.toSlot];
    if (fromItem === undefined || (toItem === undefined && packet.action === 'merge')) {
      console.warn('Tried to move an item that isn\'t registered in inventory', JSON.stringify(packet));
      return null;
    }
    switch (packet.action) {
      case 'swap':
        const fromSlot = fromItem.slot;
        const fromContainerId = fromItem.containerId;
        fromItem.containerId = toItem.containerId;
        fromItem.slot = toItem.slot;
        toItem.containerId = fromContainerId;
        toItem.slot = fromSlot;
        this.items[this.contentId][fromContainerKey][packet.fromSlot] = toItem;
        this.items[this.contentId][toContainerKey][packet.toSlot] = fromItem;
        return null;
      case 'merge':
        delete this.items[this.contentId][fromContainerKey][packet.fromSlot];
        toItem.quantity += fromItem.quantity;
        return Math.floor(fromItem.containerId / 1000) !== Math.floor(toItem.containerId / 1000) ? {
          itemId: toItem.itemId,
          containerId: toItem.containerId,
          hq: toItem.hq,
          quantity: toItem.quantity - packet.splitCount,
          retainerName: isFromRetainer ? lastSpawnedRetainer : null,
          moved: true
        } : null;
      case 'transferGil':
        const newRetainerGilCount = packet.splitCount;
        const retainerGilRef = this.items[this.contentId][`${lastSpawnedRetainer}:${ContainerType.RetainerGil}`][0];
        // Even if it's technically not possible that this is null, just check in case of a derpy behavior or weird user manipulation.
        if (retainerGilRef && this.items[this.contentId][ContainerType.Currency][0]) {
          const diff = retainerGilRef?.quantity - newRetainerGilCount;
          retainerGilRef.quantity = newRetainerGilCount;
          this.items[this.contentId][ContainerType.Currency][0].quantity -= diff;
          return null;
        }
        return null;
      case 'split':
      case 'transferCrystal':
        fromItem.quantity -= packet.splitCount;
        const newStack: InventoryItem = {
          quantity: packet.splitCount,
          containerId: packet.toContainer,
          itemId: fromItem.itemId,
          hq: fromItem.hq,
          slot: packet.toSlot,
          spiritBond: fromItem.spiritBond,
          materias: []
        };
        if (isToRetainer) {
          newStack.retainerName = lastSpawnedRetainer;
        }
        this.items[this.contentId][toContainerKey][packet.toSlot] = newStack;
        if (packet.action === 'transferCrystal') {
          return {
            ...newStack,
            retainerName: lastSpawnedRetainer
          };
        }
        return null;
      case 'discard':
        delete this.items[this.contentId][fromContainerKey][packet.fromSlot];
        return {
          itemId: fromItem.itemId,
          containerId: fromItem.containerId,
          hq: fromItem.hq,
          quantity: -packet.splitCount,
          retainerName: isFromRetainer ? lastSpawnedRetainer : null,
          emptied: true
        };
      case 'move':
        const moved = {
          ...fromItem,
          containerId: packet.toContainer,
          slot: packet.toSlot
        };
        delete this.items[this.contentId][fromContainerKey][packet.fromSlot];
        if (isFromRetainer && !isToRetainer) {
          moved.retainerName = null;
        } else if (!isFromRetainer && isToRetainer) {
          moved.retainerName = lastSpawnedRetainer;
        }
        this.items[this.contentId][toContainerKey][packet.toSlot] = moved;
        if (packet.toContainer === ContainerType.HandIn
          || packet.fromContainer === ContainerType.HandIn
          || (packet.fromContainer < 10 && packet.toContainer < 10)) {
          return null;
        }
        return {
          ...moved,
          moved: true
        };
    }
    return null;
  }

  toArray(): ItemSearchResult[] {
    this.generateSearchCacheIfNeeded();
    return this.searchCache;
  }

  getFromContainers(...containers: ContainerType[]): ItemSearchResult[] {
    return this.searchCache.filter(item => {
      return containers.includes(item.containerId);
    });
  }

  resetSearchCache(): void {
    this.searchCache = [];
    this._containers = [];
  }

  clone(): UserInventory {
    const clone = new UserInventory();
    clone.$key = this.$key;
    clone.items = { ...this.items };
    clone.lastZone = this.lastZone;
    clone.contentId = this.contentId;
    return clone;
  }

  setMarketBoardInfo(packet: ItemMarketBoardInfo, retainer: string): void {
    if (this.items[this.contentId][`${retainer}:${packet.containerId}`] && this.items[this.contentId][`${retainer}:${packet.containerId}`][packet.slot]) {
      this.items[this.contentId][`${retainer}:${packet.containerId}`][packet.slot].unitMbPrice = packet.unitPrice;
    }
  }

  updateMarketboardInfo(packet: ClientTrigger, retainer: string): void {
    if (this.items[this.contentId][`${retainer}:${ContainerType.RetainerMarket}`][packet.param1]) {
      this.items[this.contentId][`${retainer}:${ContainerType.RetainerMarket}`][packet.param1].unitMbPrice = packet.param2;
    }
  }

  private generateSearchCacheIfNeeded(): void {
    if (!this.searchCache || this.searchCache.length === 0) {
      this.searchCache = Object.keys(this.items)
        .filter(key => key !== 'ignored')
        .map(key => {
          return {
            contentId: key,
            characterInventory: this.items[key]
          };
        })
        .map(entry => {
          return Object.keys(entry.characterInventory)
            .filter(key => {
              const matches = UserInventory.DISPLAYED_CONTAINERS.includes(+key) || key.indexOf(':') > -1;
              // In some cases, items are registered as retainer while they aren't, just remove them from the output.
              if (key.indexOf(':') > -1) {
                if (+key.split(':')[1] < 10000) {
                  return false;
                }
              }
              const matchesRetainerMarket = (+key.split(':')[1] === ContainerType.RetainerMarket);
              if (this.trackItemsOnSale) {
                return matches;
              } else {
                return matches && !matchesRetainerMarket;
              }
            })
            .map(key => {
              return Object.values(entry.characterInventory[key])
                .map(item => {
                  return {
                    ...item,
                    contentId: entry.contentId,
                    isCurrentCharacter: entry.contentId === this.contentId
                  };
                });
            })
            .flat();
        })
        .flat();
      this._containers = uniqBy(this.searchCache, e => `${e.containerId}:${e.retainerName}`);
    }
  }
}
