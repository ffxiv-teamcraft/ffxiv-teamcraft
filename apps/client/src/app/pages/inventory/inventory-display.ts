import { InventoryItem } from '../../model/user/inventory/inventory-item';

export interface InventoryDisplay {
  containerId: number;

  isRetainer: boolean;

  containerName: string;

  items: InventoryItem[];

  totalPrice?: number;
}
