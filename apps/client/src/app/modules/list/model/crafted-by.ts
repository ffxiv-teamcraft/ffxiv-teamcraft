import { CompactMasterbook } from '../../../model/common/compact-masterbook';

export interface CraftedBy {
  itemId: number;
  icon: string;
  level: number;
  stars_tooltip: string;
  recipeId: string;
  jobId: number;
  masterbook?: CompactMasterbook;
}
