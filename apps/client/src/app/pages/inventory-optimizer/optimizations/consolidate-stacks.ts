import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { Memoized } from '../../../core/decorators/memoized';

export class ConsolidateStacks extends InventoryOptimizer {

  static SELECTION_KEY = 'optimizer:consolidate-stacks:selection';

  constructor(private translate: TranslateService, private inventoryFacade: InventoryFacade, private lazyData: LazyDataService) {
    super();
  }

  @Memoized()
  getPatch(id: number): any {
    return this.lazyData.patches.find(p => p.ID === id);
  }

  itemInExpansion(itemId: number, expansion: number): boolean {
    // If the specified item does not have a patch associated with it, we do not filter it.
    const itemPatch = this.lazyData.data.itemPatch[itemId];
    if (itemPatch === null) {
      return true;
    }

    // If no patch is defined for this patch that the item is assigned to, do not filter it.
    const patch = this.getPatch(itemPatch);
    if (!patch) {
      return true;
    }

    return patch.ExVersion <= expansion;
  }

  protected _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null {
    const expansion = localStorage.getItem(ConsolidateStacks.SELECTION_KEY);

    // After filtering is completed, this container will have a list of HQ-only items that need to
    // be merged with a separate type-same NQ stack.
    const toConsolidate = inventory.toArray()
      .filter(i => {
        // Implementation Note:
        //
        // Majority of items will be filtered out because the IDs do not match. Make the `itemId`
        // comparison the first condition we check for performance reasons. This means we spend less
        // time iterating the IGNORED_CONTAINERS container. In general, comparisons are performed
        // from least-expensive to most-expensive (algorithmically).
        return i.itemId === item.itemId
          // If we have no expansion selected to filter on, treat *all* items as "in expansion"
          && (expansion === null || this.itemInExpansion(item.itemId, +expansion))
          && item.hq === true
          && i.hq === false
          && i.spiritBond === 0
          && !InventoryOptimizer.inSameSlot(i, item)
          && item.quantity + i.quantity < this.lazyData.data.stackSizes[i.itemId]
          && InventoryOptimizer.IGNORED_CONTAINERS.indexOf(i.containerId) === -1;
      });

    if (toConsolidate.length === 0) {
      return null;
    }

    return {
      containers: toConsolidate.map(dupe => {
        return dupe.retainerName ||
          this.translate.instant(`INVENTORY.BAG.${this.inventoryFacade.getContainerName(dupe.containerId)}`);
      }).join(', ')
    };
  }

  getId(): string {
    return 'CONSOLIDATE_STACKS';
  }

}
