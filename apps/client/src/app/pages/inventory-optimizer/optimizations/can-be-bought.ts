import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { beastTribeNpcs } from '../../../core/data/sources/beast-tribe-npcs';
import { DataType } from '../../../modules/list/data/data-type';

export class CanBeBought extends InventoryOptimizer {

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null {
    if (!item.hq && data && getItemSource(data, DataType.VENDORS).some(v => !beastTribeNpcs.includes(v.npcId))) {
      return {};
    }
    return null;
  }

  getId(): string {
    return 'CAN_BE_BOUGHT';
  }
}
