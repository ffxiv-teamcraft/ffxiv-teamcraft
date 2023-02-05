import { I18nName } from '@ffxiv-teamcraft/types';
import { BaseSearchResult } from './base-search-result';

export interface LeveSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  level: number;
  banner: string;
  job: I18nName;
}
