export interface LazyCraftingLogPage {
  id:         number;
  masterbook: number | null;
  recipes:    Recipe[];
  startLevel: number;
}

export interface Recipe {
  itemId:   number;
  recipeId: number;
  rlvl:     number;
}
