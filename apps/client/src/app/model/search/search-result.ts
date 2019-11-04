import { Recipe } from './recipe';
import { BaseSearchResult } from './base-search-result';

export interface SearchResult extends BaseSearchResult {
  itemId: number | string;
  id?: number;
  icon: string;
  recipe?: Recipe;
  // Amount to add.
  amount: number;
  // Is amount for amount of items or craft? defaults to item.
  addCrafts?: boolean;
  selected?: boolean;
  // Is it a custom item?
  isCustom?: boolean;
}
