import { CompactMasterbook } from './compact-masterbook';

export interface CraftedBy {
  itemId: number;
  icon: string;
  level: number;
  stars_tooltip: string;
  stars_html?: string;
  recipeId: string;
  masterbook?: CompactMasterbook;
}
