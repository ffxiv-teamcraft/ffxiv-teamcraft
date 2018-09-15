import { CompactMasterbook } from '../list/compact-masterbook';
import { I18nName } from '../list/i18n-name';
import { SearchResult } from './search-result';

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
