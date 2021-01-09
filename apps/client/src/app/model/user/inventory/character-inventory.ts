import { InventoryContainer } from './inventory-container';

export interface CharacterInventory {
  [inventory: string]: InventoryContainer;
}
