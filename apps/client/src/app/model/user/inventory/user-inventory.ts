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
      hq: packet.hqFlag === 1
    };
  }
}
