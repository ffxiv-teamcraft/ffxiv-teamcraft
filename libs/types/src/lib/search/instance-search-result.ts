import { BaseSearchResult } from './base-search-result';

export interface InstanceSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  level: number;
  banner: string;
}
