import { BaseSearchResult } from './base-search-result';

export interface SearchFilter extends BaseSearchResult {
  minMax?: boolean;
  array?: boolean;
  formArray?: string;
  entryName?: string;
  canExclude?: boolean;
  value: any;
  name: string;
  displayName?: string;
}
