import { BaseSearchResult } from './base-search-result';

export interface SearchFilter extends BaseSearchResult {
  minMax: boolean;
  value: any;
  name: string;
  displayName?: string;
}
