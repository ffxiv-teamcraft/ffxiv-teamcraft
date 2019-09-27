import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { InventoryItem } from './inventory-item';
import { DeserializeAs } from '@kaiu/serializer';
import { InventoryPatch } from './inventory-patch';

export class UserInventory extends DataWithPermissions {

  @DeserializeAs([InventoryItem])
  items: InventoryItem[] = [];

  characterId: number;

  updateInventorySlot(packet: any, lastSpawnedRetainer: string): InventoryPatch {
    const isRetainer = packet.containerId >= 10000 && packet.containerId < 20000;
    let item = this.items.find(i => {
      return i.itemId === packet.catalogId
        && i.containerId === packet.containerId
        && i.slot === packet.slot
        && i.hq === (packet.hqFlag === 1);
    });
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
      this.items.push(entry);
      item = this.items[this.items.length - 1];
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
    const fromItem = this.items.find(i => {
      if (isFromRetainer) {
        return i.slot === packet.fromSlot && i.containerId === packet.fromContainer && i.retainerName === lastSpawnedRetainer;
      }
      return i.slot === packet.fromSlot && i.containerId === packet.fromContainer;
    });
    const toItem = this.items.find(i => {
      if (isToRetainer) {
        return i.slot === packet.toSlot && i.containerId === packet.toContainer && i.retainerName === lastSpawnedRetainer;
      }
      return i.slot === packet.toSlot && i.containerId === packet.toContainer;
    });
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
        this.items = this.items.filter(item => {
          return item !== fromItem;
        });
        this.items.push(moved);
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
        this.items = this.items.filter(item => {
          return item !== fromItem;
        });
        toItem.quantity += fromItem.quantity;
        return fromItem.containerId !== toItem.containerId ? {
          itemId: toItem.itemId,
          containerId: toItem.containerId,
          hq: toItem.hq,
          quantity: toItem.quantity - packet.splitCount
        } : null;
      case 'split':
        fromItem.quantity -= packet.splitCount;
        this.items.push({
          quantity: packet.splitCount,
          containerId: packet.toContainer,
          itemId: fromItem.itemId,
          hq: fromItem.hq,
          slot: packet.toSlot
        });
        return null;
      case 'discard':
        this.items = this.items.filter(item => {
          return item !== fromItem;
        });
        return {
          itemId: fromItem.itemId,
          containerId: fromItem.containerId,
          hq: fromItem.hq,
          quantity: -packet.splitCount
        };
    }
  }
}
