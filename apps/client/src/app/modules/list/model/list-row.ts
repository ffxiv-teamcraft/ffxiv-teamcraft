import { Ingredient } from '../../../model/garland-tools/ingredient';
import { DataModel } from '../../../core/database/storage/data-model';
import { Alarm } from '../../../core/alarms/alarm';
import { CompactMasterbook } from '../../../model/common/compact-masterbook';
import { ItemSource } from './item-source';
import { DataType } from '../data/data-type';

export class ListRow extends DataModel {
  icon?: number;
  id: any; // can be string or number, but we use any so less refactoring is needed.
  // The amount of items needed for the craft.
  amount: number;
  // The amount of crafts needed to get the amount of items needed.
  amount_needed?: number;
  done: number;
  used: number;
  requires?: Ingredient[] = [];
  recipeId?: string;
  yield = 1;
  alarms?: Alarm[] = [];
  masterbooks?: CompactMasterbook[] = [];

  sources?: ItemSource[] = [];

  /**
   * Is someone working on it?
   */
  workingOnIt?: string[] = [];

  /**
   * Manual flag for an item required as HQ
   */
  requiredAsHQ?: boolean;

  hidden?: boolean;


  /**
   * Should we ignore the price of this item for pricing mode?
   * @type {boolean}
   */
  usePrice?: boolean;

  custom?: boolean;

  attachedRotation?: string;

  canBeCrafted?: boolean;

  hasAllBaseIngredients?: boolean;

  craftableAmount?: number;
}

const cache = {};

export function getItemSource(item: ListRow, type: DataType, isObject = false): any {
  const key = `${item.id}:${type}`;
  if (item.sources === undefined) {
    return isObject ? {} : [];
  }
  if (!cache[key]) {
    const source = item.sources.find(s => s.type === type);
    if (source === undefined) {
      cache[key] = isObject ? {} : [];
    } else {
      cache[key] = source.data;
    }
  }
  return cache[key];
}
