import { CompactMasterbook } from '../list/compact-masterbook';
import { I18nName } from '../list/i18n-name';
import { SearchResult } from './search-result';

export interface Recipe extends SearchResult {
  amount?: number;
  recipeId: string;
  job: number;
  stars: number;
  masterbook?: CompactMasterbook;
  lvl: number;
  url_xivdb?: I18nName;
  collectible: boolean;
}
