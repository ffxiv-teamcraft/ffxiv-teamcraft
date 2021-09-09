import { ContainerInfo, InventoryTransaction, ItemInfo, UpdateInventorySlot } from '@ffxiv-teamcraft/pcap-ffxiv';
import { UserInventory } from '../../../model/user/inventory/user-inventory';

export interface InventoryState {
  itemInfoQueue: ItemInfo[],
  retainerInventoryQueue: { containerInfo: ContainerInfo, itemInfos: ItemInfo[] }[],
  retainerUpdateSlotQueue: (UpdateInventorySlot | InventoryTransaction)[],
  inventory: UserInventory,
  retainer: string
}
