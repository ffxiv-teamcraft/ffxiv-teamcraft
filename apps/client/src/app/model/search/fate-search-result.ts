import { BaseSearchResult } from './base-search-result';

export interface FateSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  level: number;
}
