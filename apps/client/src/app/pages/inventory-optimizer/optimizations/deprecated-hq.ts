import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { map } from 'rxjs/operators';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { LazyDataKey } from '../../../lazy-data/lazy-data-types';

@Injectable()
export class DeprecatedHq extends InventoryOptimizer {

  constructor(private authFacade: AuthFacade, private lazyData: LazyDataFacade) {
    super();
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): Observable<{ [p: string]: number | string } | null> {
    if (item.hq) {
      return combineLatest([
        this.lazyData.getRow('hqFlags', item.itemId, 0),
        this.lazyData.getRow('collectableFlags', item.itemId, 0),
        this.lazyData.getEntry('recipesIngredientLookup')
      ]).pipe(
        map(([hqFlag, collectableFlag, recipesIngredientLookup]) => {
          if (!recipesIngredientLookup.searchIndex[item.itemId] || hqFlag === 1 || collectableFlag === 1) {
            return null;
          }
          return {};
        })
      );
    }
    return of(null);
  }

  getId(): string {
    return 'DEPRECATED_HQ';
  }

  lazyDataEntriesNeeded(): LazyDataKey[] {
    return ['hqFlags'];
  }
}
