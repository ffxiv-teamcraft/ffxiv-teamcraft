import { BaseSearchResult } from './base-search-result';

export interface SearchFilter extends BaseSearchResult {
  minMax?: boolean;
  array?: boolean;
  formArray?: string;
  entryName?: string;
  value: any;
  name: string;
  displayName?: string;
}
