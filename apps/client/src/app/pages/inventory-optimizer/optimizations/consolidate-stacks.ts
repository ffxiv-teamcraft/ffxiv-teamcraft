import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { Memoized } from '../../../core/decorators/memoized';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { XivapiPatch } from '../../../core/data/model/xivapi-patch';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

export class ConsolidateStacks extends InventoryOptimizer {

  static SELECTION_KEY = 'optimizer:consolidate-stacks:selection';

  constructor(private translate: TranslateService, private inventoryFacade: InventoryService, private lazyData: LazyDataFacade) {
    super();
  }

  @Memoized()
  getPatch(patches: XivapiPatch[], id: number): any {
    return patches.find(p => p.ID === id);
  }

  itemInExpansion(itemId: number, expansion: number): Observable<boolean> {
    return combineLatest([
      this.lazyData.getRow('itemPatch', itemId),
      this.lazyData.patches$
    ]).pipe(
      map(([itemPatch, patches]) => {
        // If the specified item does not have a patch associated with it, we do not filter it.
        if (itemPatch === null) {
          return true;
        }

        // If no patch is defined for this patch that the item is assigned to, do not filter it.
        const patch = this.getPatch(patches, itemPatch);
        if (!patch) {
          return true;
        }
        return patch.ExVersion <= expansion;
      })
    );
  }

  getId(): string {
    return 'CONSOLIDATE_STACKS';
  }

  protected _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): Observable<{ [p: string]: number | string } | null> {
    const expansion = localStorage.getItem(ConsolidateStacks.SELECTION_KEY);

    // After filtering is completed, this container will have a list of HQ-only items that need to
    // be merged with a separate type-same NQ stack.
    return safeCombineLatest(inventory.toArray()
      .filter(i => {
        return i.itemId === item.itemId;
      })
      .map(i => {
        return combineLatest([
          this.itemInExpansion(item.itemId, +expansion),
          this.lazyData.getRow('stackSizes', item.itemId)
        ]).pipe(
          map(([isInExpansion, stackSize]) => {
            const matches = (expansion === null || isInExpansion)
              && item.hq === true
              && i.hq === false
              && i.spiritBond === 0
              && !InventoryOptimizer.inSameSlot(i, item)
              && item.quantity + i.quantity < stackSize
              && InventoryOptimizer.IGNORED_CONTAINERS.indexOf(i.containerId) === -1;
            if (matches) {
              return i;
            }
            return null;
          })
        );
      })
    ).pipe(
      map(res => {
        const toConsolidate = res.filter(row => row !== null);
        if (toConsolidate.length === 0) {
          return null;
        }

        return {
          containers: toConsolidate.map(dupe => {
            return dupe.retainerName ||
              this.translate.instant(`INVENTORY.BAG.${this.inventoryFacade.getContainerName(dupe.containerId)}`);
          }).join(', ')
        };
      })
    );
  }

}
