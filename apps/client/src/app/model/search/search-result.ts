import { Recipe } from './recipe';

export interface SearchResult {
  itemId: number;
  icon: string;
  recipe?: Recipe;
  // Amount to add.
  amount: number;
  // Is amount for amount of items or craft? defaults to item.
  addCrafts?: boolean;
  selected?: boolean;
}
