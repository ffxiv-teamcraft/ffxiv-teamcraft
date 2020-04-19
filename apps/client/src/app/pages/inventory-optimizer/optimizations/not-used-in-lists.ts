import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { Memoized } from '../../../core/decorators/memoized';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

export class NotUsedInLists extends InventoryOptimizer implements OnDestroy {
  allMaterialsOnListsSubscription: Subscription;
  allMaterialsOnLists: Set<number> = new Set();

  constructor(private lazyData: LazyDataService, private listsFacade: ListsFacade) {
    super();

    this.allMaterialsOnListsSubscription = listsFacade.allListDetails$.subscribe(lists => {
      this.allMaterialsOnLists = new Set(_.flatMap(lists, list => list.items.map(item => item.id)));
    });
  }

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } {
    return this.isMaterial(item.itemId) && !this.allMaterialsOnLists.has(item.itemId) ? {} : null;
  }

  @Memoized()
  isMaterial(itemId: number): boolean {
    return this.lazyData.data.recipes.some(recipe => {
      return recipe.ingredients.map(ingredient => ingredient.id).includes(itemId);
    });
  }

  getId(): string {
    return 'NOT_USED_IN_LISTS';
  }

  ngOnDestroy(): void {
    this.allMaterialsOnListsSubscription.unsubscribe();
  }
}
