import { ContainerInfo, ItemInfo } from '@ffxiv-teamcraft/pcap-ffxiv';
import { UserInventory } from '../../../model/user/inventory/user-inventory';

export interface InventoryState {
  itemInfoQueue: ItemInfo[],
  retainerInventoryQueue: { containerInfo: ContainerInfo, itemInfos: ItemInfo[] }[],
  inventory: UserInventory,
  retainer: string
}
