import { InventoryItem } from '../../model/user/inventory/inventory-item';

export interface InventoryDisplay {
  containerIds: (number | string)[];

  isRetainer: boolean;

  containerName: string;

  items: InventoryItem[];

  contentId: string;

  totalPrice?: number;
}
