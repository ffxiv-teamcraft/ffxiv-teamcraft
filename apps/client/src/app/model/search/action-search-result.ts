import { BaseSearchResult } from './base-search-result';

export interface ActionSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  job: any;
  level: number;
}
