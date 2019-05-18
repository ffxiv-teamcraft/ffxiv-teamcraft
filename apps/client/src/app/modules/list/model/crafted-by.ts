import { CompactMasterbook } from '../../../model/common/compact-masterbook';

export interface CraftedBy {
  itemId: number | string;
  icon: string;
  level: number;
  stars_tooltip: string;
  recipeId: string;
  jobId: number;
  masterbook?: CompactMasterbook;
  rlvl?: number;
  durability?: number;
  progression?: number;
  quality?: number;
}
