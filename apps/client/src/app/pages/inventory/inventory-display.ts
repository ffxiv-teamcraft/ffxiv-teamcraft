import { InventoryItem } from '../../model/user/inventory/inventory-item';

export interface InventoryDisplay {
  containerId: number;

  containerName: string;

  items: InventoryItem[];
}
