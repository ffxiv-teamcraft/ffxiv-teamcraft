import { SearchType } from './search-type';
import { I18nName } from '../i18n-name';

export interface BaseSearchResult extends Partial<I18nName> {
  type?: SearchType;
}
