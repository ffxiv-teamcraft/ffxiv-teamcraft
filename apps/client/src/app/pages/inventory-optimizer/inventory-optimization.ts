import { InventoryItem } from '../../model/user/inventory/inventory-item';

export interface InventoryOptimization {
  type: string;
  entries: {
    containerName: string,
    isRetainer: boolean,
    totalLength?: number,
    ignored?: boolean,
    items: {
      item: InventoryItem,
      ignored?: boolean,
      messageParams: { [index: string]: string | number }
    }[]
  }[];
  totalLength?: number;
  hidden?: boolean;
}
