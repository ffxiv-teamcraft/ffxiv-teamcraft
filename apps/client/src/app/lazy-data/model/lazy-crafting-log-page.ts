export interface LazyCraftingLogPage {
  id:         number;
  masterbook: null;
  startLevel: { [key: string]: number };
  recipes:    Recipe[];
}

export interface Recipe {
  recipeId: number;
  itemId:   number;
  rlvl:     number;
}
