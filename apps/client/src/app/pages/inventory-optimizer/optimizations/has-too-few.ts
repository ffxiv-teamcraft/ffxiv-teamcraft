import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { ExtractRow, LazyDataKey } from '@ffxiv-teamcraft/types';

export class HasTooFew extends InventoryOptimizer {

  static THRESHOLD_KEY = 'optimizer:has-few:threshold';

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ExtractRow): Observable<{ [p: string]: number | string }> {
    return this.lazyData.getRow('stackSizes', item.itemId).pipe(
      map(stackSize => {
        const threshold = +(localStorage.getItem(HasTooFew.THRESHOLD_KEY) || 3);
        if (stackSize > 1 && item.quantity <= threshold) {
          return { amount: item.quantity };
        }
        return null;
      })
    );
  }

  getId(): string {
    return 'HAS_TOO_FEW';
  }

  lazyDataEntriesNeeded(): LazyDataKey[] {
    return ['stackSizes'];
  }
}
