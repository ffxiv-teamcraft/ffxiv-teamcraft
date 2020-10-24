import { Ingredient } from '../../../model/garland-tools/ingredient';
import { DataModel } from '../../../core/database/storage/data-model';
import { Alarm } from '../../../core/alarms/alarm';
import { CompactMasterbook } from '../../../model/common/compact-masterbook';
import { ItemSource } from './item-source';
import { DataType } from '../data/data-type';
import { GatheredBy } from './gathered-by';
import { CraftedBy } from './crafted-by';
import { TradeSource } from './trade-source';
import { Vendor } from './vendor';
import { Instance } from './instance';
import { I18nName } from '../../../model/common/i18n-name';
import { Drop } from './drop';
import { Treasure } from './treasure';
import { FateData } from './fate-data';
import { TeamcraftGearsetStats } from '../../../model/user/teamcraft-gearset-stats';

export function isListRow(obj: any): obj is ListRow {
  return typeof obj === 'object'
    && obj.sources
    && obj.id !== undefined
    && obj.authorId === undefined;
}

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

  /** @deprecated use getItemSource instead, with DataType.ALARMS; **/
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
  finalItem?: boolean;
}

const cache = {};

export function getItemSource<T = any>(item: ListRow, type: DataType.CRAFTED_BY, isObject?: boolean): CraftedBy[]
export function getItemSource<T = any>(item: ListRow, type: DataType.TRADE_SOURCES, isObject?: boolean): TradeSource[]
export function getItemSource<T = any>(item: ListRow, type: DataType.VENDORS, isObject?: boolean): Vendor[]
export function getItemSource<T = any>(item: ListRow, type: DataType.REDUCED_FROM | DataType.DESYNTHS | DataType.VENTURES, isObject?: boolean): number[]
export function getItemSource<T = any>(item: ListRow, type: DataType.INSTANCES, isObject?: boolean): Instance[]
export function getItemSource<T = any>(item: ListRow, type: DataType.GATHERED_BY, isObject?: boolean): GatheredBy
export function getItemSource<T = any>(item: ListRow, type: DataType.GARDENING, isObject?: boolean): number
export function getItemSource<T = any>(item: ListRow, type: DataType.VOYAGES, isObject?: boolean): I18nName[]
export function getItemSource<T = any>(item: ListRow, type: DataType.DROPS, isObject?: boolean): Drop[]
export function getItemSource<T = any>(item: ListRow, type: DataType.ALARMS, isObject?: boolean): Alarm[]
export function getItemSource<T = any>(item: ListRow, type: DataType.MASTERBOOKS, isObject?: boolean): CompactMasterbook[]
export function getItemSource<T = any>(item: ListRow, type: DataType.TREASURES, isObject?: boolean): Treasure[]
export function getItemSource<T = any>(item: ListRow, type: DataType.FATES, isObject?: boolean): FateData[]
export function getItemSource<T = any>(item: ListRow, type: DataType, isObject?: boolean): T
export function getItemSource<T = any>(item: ListRow, type: DataType, isObject = false): T {
  const key = `${item.id}:${type}`;
  if (item.sources === undefined) {
    return (isObject ? {} : []) as any;
  }
  if (!cache[key]) {
    const source = item.sources.find(s => s.type === type);
    if (source === undefined) {
      if (type === DataType.ALARMS && item.alarms && item.alarms.length > 0) {
        cache[key] = item.alarms;
      } else {
        cache[key] = isObject ? {} : [];
      }
    } else {
      cache[key] = source.data;
    }
  }
  return cache[key];
}

export function getCraftByPriority(crafts: CraftedBy[], sets: TeamcraftGearsetStats[]): CraftedBy {
  if (crafts.length === 1) {
    return crafts[0];
  }
  return crafts.sort((a, b) => {
    return sets.findIndex(s => s.jobId === b.job) - sets.findIndex(s => s.jobId === a.job);
  })[0];
}
