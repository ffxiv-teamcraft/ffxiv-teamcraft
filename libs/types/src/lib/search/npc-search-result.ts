import { I18nName } from '@ffxiv-teamcraft/types';
import { BaseSearchResult } from './base-search-result';

export interface NpcSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  title: I18nName;
}
