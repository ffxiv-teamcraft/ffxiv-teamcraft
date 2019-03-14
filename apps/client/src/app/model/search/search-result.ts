import { Recipe } from './recipe';

export interface SearchResult {
  itemId: number | string;
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
