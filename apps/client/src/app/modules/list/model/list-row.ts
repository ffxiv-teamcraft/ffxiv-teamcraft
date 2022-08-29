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
import { I18nName } from '../../../model/common/i18n-name';
import { Drop } from './drop';
import { FateData } from './fate-data';
import { TeamcraftGearsetStats } from '../../../model/user/teamcraft-gearset-stats';
import { GardeningData } from './gardening-data';
import { MogstationItem } from './mogstation-item';
import { LazyDataI18nKey } from '../../../lazy-data/lazy-data-types';

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

  contentType?: LazyDataI18nKey;

  xivapiIcon?: string;

  done: number;

  used: number;

  requires?: Ingredient[] = [];

  recipeId?: string;

  yield = 1;

  collectable = false;

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

  custom?: boolean;

  attachedRotation?: string;

  canBeCrafted?: boolean;

  hasAllBaseIngredients?: boolean;

  craftableAmount?: number;

  finalItem?: boolean;
}

export function getItemSource<T = any>(item: ListRow, type: DataType.CRAFTED_BY, isObject?: boolean): CraftedBy[]
export function getItemSource<T = any>(item: ListRow, type: DataType.TRADE_SOURCES, isObject?: boolean): TradeSource[]
export function getItemSource<T = any>(item: ListRow, type: DataType.VENDORS, isObject?: boolean): Vendor[]
export function getItemSource<T = any>(item: ListRow, type: DataType.REDUCED_FROM | DataType.DESYNTHS | DataType.VENTURES | DataType.TREASURES | DataType.INSTANCES | DataType.QUESTS, isObject?: boolean): number[]
export function getItemSource<T = any>(item: ListRow, type: DataType.GATHERED_BY, isObject?: boolean): GatheredBy
export function getItemSource<T = any>(item: ListRow, type: DataType.GARDENING, isObject?: boolean): GardeningData
export function getItemSource<T = any>(item: ListRow, type: DataType.VOYAGES, isObject?: boolean): I18nName[]
export function getItemSource<T = any>(item: ListRow, type: DataType.DROPS, isObject?: boolean): Drop[]
export function getItemSource<T = any>(item: ListRow, type: DataType.ALARMS, isObject?: boolean): Alarm[]
export function getItemSource<T = any>(item: ListRow, type: DataType.MASTERBOOKS, isObject?: boolean): CompactMasterbook[]
export function getItemSource<T = any>(item: ListRow, type: DataType.FATES, isObject?: boolean): FateData[]
export function getItemSource<T = any>(item: ListRow, type: DataType.REQUIREMENTS, isObject?: boolean): Ingredient[]
export function getItemSource<T = any>(item: ListRow, type: DataType.MOGSTATION, isObject?: boolean): MogstationItem
export function getItemSource<T = any>(item: ListRow, type: DataType, isObject?: boolean): T
export function getItemSource<T = any>(item: ListRow, type: DataType, isObject = false): T {
  if (item.sources === undefined) {
    return (isObject ? {} : []) as any;
  }
  const source = item.sources.find(s => s.type === type);
  if (source === undefined) {
    if (type === DataType.ALARMS && item.alarms && item.alarms.length > 0) {
      return item.alarms as any;
    } else {
      return isObject ? {} : [] as any;
    }
  } else {
    return source.data;
  }
}

export function getCraftByPriority(crafts: CraftedBy[], sets: TeamcraftGearsetStats[]): CraftedBy {
  if (crafts.length <= 1) {
    return crafts[0];
  }
  return crafts.sort((a, b) => {
    return sets.find(s => s.jobId === b.job)?.priority - sets.find(s => s.jobId === a.job)?.priority;
  })[0];
}
