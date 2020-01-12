import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';

export class Duplicates extends InventoryOptimizer {

  constructor(private translate: TranslateService, private inventoryFacade: InventoryFacade, private lazyData: LazyDataService) {
    super();
  }

  protected _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null {
    const dupes = inventory.toArray()
      .filter(i => {
        return InventoryOptimizer.IGNORED_CONTAINERS.indexOf(i.containerId) === -1;
      })
      .filter(i => {
        return i.itemId === item.itemId
          && i.hq === item.hq
          && i.spiritBond === 0
          && i.slot !== item.slot
          && item.quantity + i.quantity < this.lazyData.data.stackSizes[i.itemId];
      });
    if (dupes.length > 0) {
      return {
        containers: dupes.map(dupe => {
          return dupe.retainerName || this.translate.instant(`INVENTORY.BAG.${this.inventoryFacade.getContainerName(dupe.containerId)}`);
        }).join(', ')
      };
    }
    return null;
  }

  getId(): string {
    return 'DUPLICATES';
  }

}
