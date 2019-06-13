import { BaseSearchResult } from './base-search-result';

export interface StatusSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  data: any;
}
