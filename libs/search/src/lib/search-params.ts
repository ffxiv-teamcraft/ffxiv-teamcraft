import { I18nName, SearchType } from '@ffxiv-teamcraft/types';
import { XIVSearchFilter } from './xiv-search-filter';

export interface SearchParams {
  query: string,
  type: SearchType,
  lang: keyof I18nName,
  filters?: XIVSearchFilter[],
  sort?: [string, 'asc' | 'desc']
}
