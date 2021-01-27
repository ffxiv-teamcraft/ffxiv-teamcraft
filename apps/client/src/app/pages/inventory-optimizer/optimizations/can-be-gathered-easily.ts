import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { Injectable } from '@angular/core';
import { DataType } from '../../../modules/list/data/data-type';
import { GatheredBy } from '../../../modules/list/model/gathered-by';

@Injectable()
export class CanBeGatheredEasily extends InventoryOptimizer {

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null {
    try {
      const gatheredBy = getItemSource<GatheredBy>(data, DataType.GATHERED_BY);
      if (gatheredBy && gatheredBy.nodes) {
        if (gatheredBy.nodes.some(node => {
          return !node.duration && !node.matchingItemIsHidden && !node.limited && (!node.spawns || node.spawns.length === 0) && !node.weathers && !node.weathersFrom;
        })) {
          return { level: gatheredBy.level };
        }
      }
      return null;
    } catch (_) {
      return null;
    }

  }

  getId(): string {
    return 'CAN_BE_GATHERED_EASILY';
  }
}
