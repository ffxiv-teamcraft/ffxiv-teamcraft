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
        containerId: 3200
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

  operateTransaction(packet: any): InventoryPatch | null {
    const fromItem = this.items.find(i => {
      return i.slot === packet.fromSlot && i.containerId === packet.fromContainer;
    });
    const toItem = this.items.find(i => {
      return i.slot === packet.fromSlot && i.containerId === packet.fromContainer;
    });
    if (fromItem === undefined || (toItem === undefined && packet.action === 'merge')) {
      console.warn('Tried to move an item that isn\'t registered in inventory');
      return null;
    }
    switch (packet.action) {
      case 'move':
        fromItem.containerId = packet.toContainer;
        fromItem.slot = packet.toSlot;
        return {
          itemId: fromItem.itemId,
          containerId: fromItem.containerId,
          hq: fromItem.hq,
          quantity: fromItem.quantity
        };
      case 'merge':
        fromItem.quantity -= packet.splitCount;
        toItem.quantity += packet.splitCount;
        return {
          itemId: toItem.itemId,
          containerId: toItem.containerId,
          hq: toItem.hq,
          quantity: packet.splitCount
        };
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
        fromItem.quantity = 0;
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
