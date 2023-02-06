import { BaseSearchResult } from './base-search-result';

export interface SearchFilter extends BaseSearchResult {
  name: string;
  value: any;
  minMax?: boolean;
  array?: boolean;
  formArray?: string;
  entryName?: string;
  canExclude?: boolean;
  displayName?: string;
}
