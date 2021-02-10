import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { first } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Injectable()
export class UselessHq extends InventoryOptimizer {

  private levels: Record<number, number> = {};

  constructor(private authFacade: AuthFacade, private lazyData: LazyDataService) {
    super();
    this.authFacade.gearSets$.pipe(
      first()
    ).subscribe(gearsets => {
      gearsets.forEach(gearset => {
        this.levels[gearset.jobId] = gearset.level;
      });
    });
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null {
    if (item.hq && data) {
      const lookupEntry = this.lazyData.data.recipesIngredientLookup.searchIndex[item.itemId];
      if (lookupEntry) {
        const uselessHq = lookupEntry
          .map(recipeId => {
            return this.lazyData.data.recipesIngredientLookup.recipes[recipeId];
          })
          .reduce((acc, recipe) => {
            return acc && (this.levels[recipe.job] || 0) >= 80 && recipe.lvl <= 70;
          }, true);
        if (uselessHq) {
          return {};
        }
      }
    }
    return null;
  }

  getId(): string {
    return 'USELESS_HQ';
  }
}
