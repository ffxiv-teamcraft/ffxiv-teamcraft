import { I18nName } from '../common/i18n-name';
import { BaseSearchResult } from './base-search-result';

export interface NpcSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  title: I18nName;
}
