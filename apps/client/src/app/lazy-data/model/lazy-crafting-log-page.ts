export interface LazyCraftingLogPage {
  id:         number;
  masterbook: number | null;
  startLevel: number;
  recipes:    Recipe[];
}

export interface Recipe {
  recipeId: number;
  itemId:   number;
  rlvl:     number;
}
