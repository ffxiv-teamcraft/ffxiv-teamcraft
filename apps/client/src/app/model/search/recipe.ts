import { CompactMasterbook } from '../common/compact-masterbook';

export interface Recipe {
  itemId: number;
  icon: string;
  recipeId: string;
  job: number;
  stars: number;
  masterbook?: CompactMasterbook;
  lvl: number;
  collectible: boolean;
}
