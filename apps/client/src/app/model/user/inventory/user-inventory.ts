import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { InventoryItem } from './inventory-item';
import { DeserializeAs } from '@kaiu/serializer';
import { InventoryPatch } from './inventory-patch';

export class UserInventory extends DataWithPermissions {

  @DeserializeAs([InventoryItem])
  items: InventoryItem[] = [];

  characterId: number;

  updateInventorySlot(packet: any): InventoryPatch {
    let item = this.items.find(i => {
      return i.itemId === packet.catalogId
        && i.containerId === packet.containerId
        && i.slot === packet.slot
        && i.hq === (packet.hqFlag === 1);
    });
    const previousQuantity = item ? item.quantity : 0;
    // This can happen if user modifies inventory before zoning.
    if (item === undefined) {
      this.items.push({
        itemId: packet.catalogId,
        quantity: packet.quantity,
        hq: packet.hqFlag === 1,
        slot: packet.slot,
        containerId: packet.containerId
      });
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
    const isFromRetainer = packet.fromContainer > 10000 && packet.fromContainer < 20000;
    const isToRetainer = packet.toContainer > 10000 && packet.toContainer < 20000;
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
        fromItem.containerId = packet.toContainer;
        fromItem.slot = packet.toSlot;
        if (isFromRetainer && !isToRetainer) {
          delete fromItem.retainerName;
        } else if (!isFromRetainer && isToRetainer) {
          fromItem.retainerName = lastSpawnedRetainer;
        }
        return {
          itemId: fromItem.itemId,
          containerId: fromItem.containerId,
          hq: fromItem.hq,
          quantity: fromItem.quantity
        };
      case 'swap':
        const fromSlot = fromItem.slot;
        const fromContainer = fromItem.containerId;
        fromItem.containerId = toItem.containerId;
        fromItem.slot = toItem.slot;
        toItem.containerId = fromContainer;
        toItem.slot = fromSlot;
        return null;
      case 'merge':
        fromItem.quantity -= packet.splitCount;
        toItem.quantity += packet.splitCount;
        return fromItem.containerId !== toItem.containerId ? {
          itemId: toItem.itemId,
          containerId: toItem.containerId,
          hq: toItem.hq,
          quantity: packet.splitCount
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
