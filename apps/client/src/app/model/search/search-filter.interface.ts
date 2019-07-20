import { BaseSearchResult } from './base-search-result';

export interface SearchFilter extends BaseSearchResult {
  minMax?: boolean;
  array?:boolean;
  value: any;
  name: string;
  displayName?: string;
}
