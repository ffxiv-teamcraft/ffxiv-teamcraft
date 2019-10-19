import { InventoryItem } from './inventory-item';

export interface InventoryContainer {
  [slot: number]: InventoryItem;
}
