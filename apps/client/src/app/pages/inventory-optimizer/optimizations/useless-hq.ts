import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { Injectable } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { first, map } from 'rxjs/operators';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Observable, of } from 'rxjs';
import { LazyDataKey } from '../../../lazy-data/lazy-data-types';

@Injectable()
export class UselessHq extends InventoryOptimizer {

  private levels: Record<number, number> = {};

  constructor(private authFacade: AuthFacade, private lazyData: LazyDataFacade) {
    super();
    this.authFacade.gearSets$.pipe(
      first()
    ).subscribe(gearsets => {
      gearsets.forEach(gearset => {
        this.levels[gearset.jobId] = gearset.level;
      });
    });
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): Observable<{ [p: string]: number | string } | null> {
    if (item.hq && data) {
      return this.lazyData.getEntry('recipesIngredientLookup').pipe(
        map(recipesIngredientLookup => {
          const lookupEntry = recipesIngredientLookup.searchIndex[item.itemId];
          if (lookupEntry) {
            const uselessHq = lookupEntry
              .map(recipeId => {
                return recipesIngredientLookup.recipes[recipeId];
              })
              .reduce((acc, recipe) => {
                return acc && (this.levels[recipe.job] || 0) >= 80 && recipe.lvl <= 70;
              }, true);
            if (uselessHq) {
              return {};
            }
          }
        })
      );
    }
    return of(null);
  }

  getId(): string {
    return 'USELESS_HQ';
  }

  lazyDataEntriesNeeded(): LazyDataKey[] {
    return ['recipesIngredientLookup'];
  }
}
