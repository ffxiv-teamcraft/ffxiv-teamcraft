import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { Injectable } from '@angular/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Injectable()
export class CanExtractMateria extends InventoryOptimizer {

  constructor(private lazyData: LazyDataService) {
    super();
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null {
    if (item.spiritBond === 10000 && this.lazyData.data.extractableItems[item.itemId] === 1) {
      return {};
    }
    return null;
  }

  getId(): string {
    return 'CAN_EXTRACT_MATERIA';
  }
}
