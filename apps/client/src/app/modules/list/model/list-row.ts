import { DataModel } from '../../../core/database/storage/data-model';
import { CraftedBy } from './crafted-by';
import { CompactMasterbook, ExtractRow, Ingredient, ItemSource, LazyDataI18nKey } from '@ffxiv-teamcraft/types';
import { TeamcraftGearsetStats } from '../../../model/user/teamcraft-gearset-stats';

export function isListRow(obj: any): obj is ListRow {
  return typeof obj === 'object'
    && obj.sources
    && obj.id !== undefined
    && obj.authorId === undefined;
}

export class ListRow extends DataModel implements ExtractRow {
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

  masterbooks?: CompactMasterbook[] = [];

  sources: ItemSource[] = [];

  /**
   * Is someone working on it?
   */
  workingOnIt?: string[] = [];

  /**
   * Manual flag for an item required as HQ
   */
  forceRequiredHQ?: boolean;

  hidden?: boolean;

  custom?: boolean;

  attachedRotation?: string;

  canBeCrafted?: boolean;

  hasAllBaseIngredients?: boolean;

  craftableAmount?: number;

  finalItem?: boolean;

  requiredHQ?: number;
}

export function getCraftByPriority(crafts: CraftedBy[], sets: TeamcraftGearsetStats[]): CraftedBy {
  if (crafts.length <= 1) {
    return crafts[0];
  }
  return [...crafts].sort((a, b) => {
    return sets.find(s => s.jobId === b.job)?.priority - sets.find(s => s.jobId === a.job)?.priority;
  })[0];
}
