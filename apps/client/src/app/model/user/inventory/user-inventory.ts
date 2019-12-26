import { InventoryItem } from './inventory-item';
import { InventoryPatch } from './inventory-patch';
import { InventoryContainer } from './inventory-container';
import { DataModel } from '../../../core/database/storage/data-model';
import { ContainerType } from './container-type';
import * as firebase from 'firebase/app';

export class UserInventory extends DataModel {

  public static readonly DISPLAYED_CONTAINERS = [
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
    ContainerType.RetainerMarket
  ];

  items: { [index: string]: InventoryContainer } = {};

  characterId: number;

  lastZone: firebase.firestore.Timestamp;

  getItem(itemId: number, onlyUserInventory = false): InventoryItem[] {
    return [].concat.apply([],
      Object.keys(this.items)
        .filter(key => {
          let matches = UserInventory.DISPLAYED_CONTAINERS.indexOf(+key) > -1 || key.indexOf(':') > -1;
          if (onlyUserInventory) {
            matches = matches && +key < 10;
          }
          const matchesRetainerMarket = (+key.split(':')[1] === ContainerType.RetainerMarket);
          if (localStorage.getItem('trackItemsOnSale') === 'true') {
            return matches;
          } else {
            return matches && !matchesRetainerMarket;
          }
        })
        .map(key => {
          return Object.keys(this.items[key])
            .map(slot => this.items[key][slot]);
        })
    ).filter(item => item.itemId === itemId);
  }

  updateInventorySlot(packet: any, lastSpawnedRetainer: string): InventoryPatch | null {
    const isRetainer = packet.containerId >= 10000 && packet.containerId < 20000;
    const containerKey = isRetainer ? `${lastSpawnedRetainer}:${packet.containerId}` : `${packet.containerId}`;
    if (this.items[containerKey] === undefined) {
      return null;
    }
    let item = this.items[containerKey][packet.slot];
    const previousQuantity = item ? item.quantity : 0;
    if (packet.quantity === 0 && packet.catalogId === 0) {
      delete this.items[containerKey][packet.slot];
      if (item !== undefined) {
        return {
          itemId: item.itemId,
          quantity: -1 * item.quantity,
          containerId: packet.containerId,
          hq: item.hq,
          spiritBond: item.spiritBond
        };
      }
      return null;
    }
    // Happens if you add an item that you never had in your inventory before (in an empty slot)
    if (item === undefined && packet.quantity > 0) {
      const entry: InventoryItem = {
        itemId: packet.catalogId,
        quantity: packet.quantity,
        hq: packet.hqFlag === 1,
        slot: packet.slot,
        containerId: packet.containerId,
        spiritBond: +packet.spiritBond
      };
      if (isRetainer) {
        entry.retainerName = lastSpawnedRetainer;
      }
      this.items[containerKey][packet.slot] = entry;
      item = this.items[containerKey][packet.slot];
    }
    item.quantity = packet.quantity;
    item.hq = packet.hqFlag === 1;
    if (packet.quantity - previousQuantity !== 0) {
      return {
        itemId: packet.catalogId,
        quantity: packet.quantity - previousQuantity,
        containerId: packet.containerId,
        hq: packet.hqFlag === 1
      };
    }
    return null;
  }

  operateTransaction(packet: any, lastSpawnedRetainer: string): InventoryPatch | null {
    const isFromRetainer = packet.fromContainer >= 10000 && packet.fromContainer < 20000;
    const isToRetainer = packet.toContainer >= 10000 && packet.toContainer < 20000;
    const fromContainerKey = isFromRetainer ? `${lastSpawnedRetainer}:${packet.fromContainer}` : `${packet.fromContainer}`;
    const toContainerKey = isToRetainer ? `${lastSpawnedRetainer}:${packet.toContainer}` : `${packet.toContainer}`;

    const fromContainer = this.items[fromContainerKey];
    let toContainer = this.items[toContainerKey];
    if (toContainer === undefined) {
      this.items[toContainerKey] = {};
      toContainer = this.items[toContainerKey];
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
      case 'move':
        const moved = {
          ...fromItem,
          containerId: packet.toContainer,
          slot: packet.toSlot
        };
        delete this.items[fromContainerKey][packet.fromSlot];
        if (isFromRetainer && !isToRetainer) {
          delete moved.retainerName;
        } else if (!isFromRetainer && isToRetainer) {
          moved.retainerName = lastSpawnedRetainer;
        }
        this.items[toContainerKey][packet.toSlot] = moved;
        if (packet.toContainer === ContainerType.HandIn
          || packet.fromContainer === ContainerType.HandIn
          || (packet.fromContainer < 10 && packet.toContainer < 10)) {
          return null;
        }
        return moved;
      case 'swap':
        const fromSlot = fromItem.slot;
        const fromContainerId = fromItem.containerId;
        fromItem.containerId = toItem.containerId;
        fromItem.slot = toItem.slot;
        toItem.containerId = fromContainerId;
        toItem.slot = fromSlot;
        return null;
      case 'merge':
        delete this.items[fromContainerKey][packet.fromSlot];
        toItem.quantity += fromItem.quantity;
        return fromItem.containerId !== toItem.containerId ? {
          itemId: toItem.itemId,
          containerId: toItem.containerId,
          hq: toItem.hq,
          quantity: toItem.quantity - packet.splitCount
        } : null;
      case 'split':
        fromItem.quantity -= packet.splitCount;
        const newStack: InventoryItem = {
          quantity: packet.splitCount,
          containerId: packet.toContainer,
          itemId: fromItem.itemId,
          hq: fromItem.hq,
          slot: packet.toSlot,
          spiritBond: fromItem.spiritBond
        };
        if (isToRetainer) {
          newStack.retainerName = lastSpawnedRetainer;
        }
        this.items[toContainerKey][packet.toSlot] = newStack;
        return null;
      case 'discard':
        delete this.items[fromContainerKey][packet.fromSlot];
        return {
          itemId: fromItem.itemId,
          containerId: fromItem.containerId,
          hq: fromItem.hq,
          quantity: -packet.splitCount
        };
    }
  }

  toArray(): InventoryItem[] {
    return [].concat.apply([], Object.keys(this.items)
      .map(key => this.items[key])
      .map(container => {
        return Object.keys(container)
          .map(key => container[key]);
      })
    );
  }

  clone(): UserInventory {
    const clone = new UserInventory();
    clone.$key = this.$key;
    clone.items = { ...this.items };
    clone.characterId = this.characterId;
    clone.lastZone = this.lastZone;
    return clone;
  }

  afterDeserialized(): void {
    if (typeof this.lastZone !== 'object') {
      this.lastZone = firebase.firestore.Timestamp.fromDate(new Date(this.lastZone));
    } else if (!(this.lastZone instanceof firebase.firestore.Timestamp)) {
      this.lastZone = new firebase.firestore.Timestamp((this.lastZone as any).seconds, (this.lastZone as any).nanoseconds);
    }
  }
}
