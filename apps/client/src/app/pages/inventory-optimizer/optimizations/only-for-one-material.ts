import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { Injectable } from '@angular/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';

@Injectable()
export class OnlyForOneMaterial extends InventoryOptimizer {

  constructor(private lazyData: LazyDataService, private i18n: I18nToolsService,
              private l12n: LocalizedDataService) {
    super();
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null {
    try {
      const recipesWithThisItem = this.lazyData.data.recipesIngredientLookup.searchIndex[item.itemId] || [];
      if (recipesWithThisItem.length === 1
        && this.lazyData.data.recipesIngredientLookup.searchIndex[this.lazyData.data.recipesIngredientLookup.recipes[recipesWithThisItem[0]].itemId]) {
        return {
          targetItem: this.i18n.getName(this.l12n.getItem(this.lazyData.data.recipesIngredientLookup.recipes[recipesWithThisItem[0]].itemId))
        };
      }
      return null;
    } catch (_) {
      return null;
    }

  }

  getId(): string {
    return 'ONLY_FOR_ONE_MATERIAL';
  }
}
