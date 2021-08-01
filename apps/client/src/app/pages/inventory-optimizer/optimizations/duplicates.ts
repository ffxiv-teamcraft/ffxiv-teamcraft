import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { uniq } from 'lodash';

export class Duplicates extends InventoryOptimizer {

  constructor(private translate: TranslateService, private inventoryFacade: InventoryService, private lazyData: LazyDataService) {
    super();
  }

  protected _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null {
    const dupes = inventory.toArray()
      .filter(i => {
        let matches = i.contentId === inventory.contentId;
        if (!inventory.trackItemsOnSale) {
          matches = i.containerId !== ContainerType.RetainerMarket;
        }
        return matches && InventoryOptimizer.IGNORED_CONTAINERS.indexOf(i.containerId) === -1;
      })
      .filter(i => {
        return i.itemId === item.itemId
          && i.hq === item.hq
          && i.spiritBond === 0
          && !InventoryOptimizer.inSameSlot(i, item)
          && item.quantity + i.quantity < this.lazyData.data.stackSizes[i.itemId];
      });
    if (dupes.length > 0) {
      return {
        containers: uniq(dupes).map(dupe => {
          return this.inventoryFacade.getContainerDisplayName(dupe);
        }).join(', ')
      };
    }
    return null;
  }

  getId(): string {
    return 'DUPLICATES';
  }

}
