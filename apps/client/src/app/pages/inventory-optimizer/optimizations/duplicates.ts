import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { ListRow } from '../../../modules/list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { uniq } from 'lodash';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LazyDataKey } from '../../../lazy-data/lazy-data-types';

export class Duplicates extends InventoryOptimizer {

  constructor(private translate: TranslateService, private inventoryFacade: InventoryService, private lazyData: LazyDataFacade) {
    super();
  }

  getId(): string {
    return 'DUPLICATES';
  }

  lazyDataEntriesNeeded(): LazyDataKey[] {
    return ['stackSizes'];
  }

  protected _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): Observable<{ [p: string]: number | string } | null> {
    return this.lazyData.getEntry('stackSizes').pipe(
      map(stackSizes => {
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
              && item.quantity + i.quantity < stackSizes[i.itemId];
          });
        if (dupes.length > 0) {
          return {
            containers: uniq(dupes).map(dupe => {
              return this.inventoryFacade.getContainerDisplayName(dupe);
            }).join(', ')
          };
        }
        return null;
      })
    );

  }

}
