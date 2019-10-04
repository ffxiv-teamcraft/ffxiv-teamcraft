import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { InventoryItem } from './inventory-item';
import { InventoryPatch } from './inventory-patch';
import { InventoryContainer } from './inventory-container';

export class UserInventory extends DataWithPermissions {

  items: { [index: string]: InventoryContainer } = {};

  characterId: number;

  getItem(itemId: number): InventoryItem[] {
    return [].concat.apply([],
      Object.keys(this.items)
        .map(key => {
          return Object.keys(this.items[key])
            .map(slot => this.items[key][slot]);
        })
    ).filter(item => item.itemId === itemId);
  }

  updateInventorySlot(packet: any, lastSpawnedRetainer: string): InventoryPatch {
    const isRetainer = packet.containerId >= 10000 && packet.containerId < 20000;
    const containerKey = isRetainer ? `${lastSpawnedRetainer}:${packet.containerId}` : `${packet.containerId}`;
    let item = this.items[containerKey][packet.slot];
    const previousQuantity = item ? item.quantity : 0;
    // This can happen if user modifies inventory before zoning.
    if (item === undefined) {
      const entry: InventoryItem = {
        itemId: packet.catalogId,
        quantity: packet.quantity,
        hq: packet.hqFlag === 1,
        slot: packet.slot,
        containerId: packet.containerId
      };
      if (isRetainer) {
        entry.retainerName = lastSpawnedRetainer;
      }
      this.items[containerKey][packet.slot] = entry;
      item = this.items[containerKey][packet.slot];
    }
    item.quantity = packet.quantity;
    return {
      itemId: packet.catalogId,
      quantity: packet.quantity - previousQuantity,
      containerId: packet.containerId,
      hq: packet.hqFlag === 1
    };
  }

  operateTransaction(packet: any, lastSpawnedRetainer: string): InventoryPatch | null {
    const isFromRetainer = packet.fromContainer >= 10000 && packet.fromContainer < 20000;
    const isToRetainer = packet.toContainer >= 10000 && packet.toContainer < 20000;
    const fromContainerKey = isFromRetainer ? `${lastSpawnedRetainer}:${packet.containerId}` : `${packet.containerId}`;
    const toContainerKey = isToRetainer ? `${lastSpawnedRetainer}:${packet.containerId}` : `${packet.containerId}`;

    const fromContainer = this.items[fromContainerKey];
    const toContainer = this.items[toContainerKey];
    if (fromContainer === undefined || (toContainer === undefined && packet.action === 'merge')) {
      console.warn('Tried to move an item to an inexisting container ', fromContainerKey, toContainerKey);
      return null;
    }

    const fromItem = fromContainer[packet.fromSlot];
    const toItem = toContainer[packet.toSlot];
    if (fromItem === undefined || (toItem === undefined && packet.action === 'merge')) {
      console.warn('Tried to move an item that isn\'t registered in inventory');
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
        delete this.items[toContainerKey][packet.toSlot];
        if (isFromRetainer && !isToRetainer) {
          delete moved.retainerName;
        } else if (!isFromRetainer && isToRetainer) {
          moved.retainerName = lastSpawnedRetainer;
        }
        return moved;
      case 'swap':
        const fromSlot = fromItem.slot;
        const fromContainer = fromItem.containerId;
        fromItem.containerId = toItem.containerId;
        fromItem.slot = toItem.slot;
        toItem.containerId = fromContainer;
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
        this.items[toContainerKey][packet.toSlot] = {
          quantity: packet.splitCount,
          containerId: packet.toContainer,
          itemId: fromItem.itemId,
          hq: fromItem.hq,
          slot: packet.toSlot
        };
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

  public clone(): UserInventory {
    const clone = new UserInventory();
    clone.$key = this.$key;
    clone.authorId = this.authorId;
    clone.items = JSON.parse(JSON.stringify(this.items));
    clone.characterId = this.characterId;
    return clone;
  }
}
