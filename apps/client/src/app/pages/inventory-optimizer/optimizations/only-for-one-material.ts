import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { Injectable } from '@angular/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OnlyForOneMaterial extends InventoryOptimizer {

  constructor(private lazyData: LazyDataFacade, private i18n: I18nToolsService,
              private l12n: LocalizedDataService) {
    super();
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): Observable<{ [p: string]: number | string } | null> {
    return this.lazyData.getEntry('recipesIngredientLookup').pipe(
      map(recipesIngredientLookup => {
        try {
          const recipesWithThisItem = recipesIngredientLookup.searchIndex[item.itemId] || [];
          if (recipesWithThisItem.length === 1
            && recipesIngredientLookup.searchIndex[recipesIngredientLookup.recipes[recipesWithThisItem[0]].itemId]) {
            return {
              targetItem: this.i18n.getName(this.l12n.getItem(recipesIngredientLookup.recipes[recipesWithThisItem[0]].itemId))
            };
          }
          return null;
        } catch (_) {
          return null;
        }
      })
    );
  }

  getId(): string {
    return 'ONLY_FOR_ONE_MATERIAL';
  }
}
