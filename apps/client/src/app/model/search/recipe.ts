import { CompactMasterbook } from '../common/compact-masterbook';
import { I18nName } from '../common/i18n-name';
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
