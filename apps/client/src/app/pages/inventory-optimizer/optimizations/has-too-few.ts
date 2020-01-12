import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { LazyDataService } from '../../../core/data/lazy-data.service';

export class HasTooFew extends InventoryOptimizer {

  static THRESHOLD_KEY = 'optimizer:has-few:threshold';

  constructor(private lazyData: LazyDataService) {
    super();
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } {
    const threshold = +(localStorage.getItem(HasTooFew.THRESHOLD_KEY) || 3);
    if (this.lazyData.data.stackSizes[item.itemId] > 1 && item.quantity <= threshold) {
      return { amount: item.quantity };
    }
    return null;
  }

  getId(): string {
    return 'HAS_TOO_FEW';
  }
}
