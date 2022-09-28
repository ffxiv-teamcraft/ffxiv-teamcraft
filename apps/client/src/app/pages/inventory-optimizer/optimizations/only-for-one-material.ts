import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { Injectable } from '@angular/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LazyDataKey } from '../../../lazy-data/lazy-data-types';

@Injectable()
export class OnlyForOneMaterial extends InventoryOptimizer {

  constructor(private lazyData: LazyDataFacade, private i18n: I18nToolsService) {
    super();
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): Observable<{ [p: string]: number | string } | null> {
    return this.lazyData.getEntry('recipesIngredientLookup').pipe(
      switchMap(recipesIngredientLookup => {
        try {
          const recipesWithThisItem = recipesIngredientLookup.searchIndex[item.itemId] || [];
          if (recipesWithThisItem.length === 1
            && recipesIngredientLookup.recipes[recipesWithThisItem[0]].ingredients.find(i => i.id === item.itemId)?.amount <= item.quantity
            && recipesIngredientLookup.searchIndex[recipesIngredientLookup.recipes[recipesWithThisItem[0]].itemId]) {
            return this.i18n.getNameObservable('items', recipesIngredientLookup.recipes[recipesWithThisItem[0]].itemId).pipe(
              map(targetItem => {
                const entry = recipesIngredientLookup.recipes[recipesWithThisItem[0]];
                return {
                  targetItem,
                  targetItemId: entry.itemId,
                  targetRecipeId: entry.recipeId,
                  amount: Math.floor(item.quantity / entry.ingredients.find(i => i.id === item.itemId)?.amount) * entry.yields
                };
              })
            );
          }
          return of(null);
        } catch (_) {
          return of(null);
        }
      })
    );
  }

  getId(): string {
    return 'ONLY_FOR_ONE_MATERIAL';
  }

  lazyDataEntriesNeeded(): LazyDataKey[] {
    return ['recipesIngredientLookup', 'items'];
  }
}
