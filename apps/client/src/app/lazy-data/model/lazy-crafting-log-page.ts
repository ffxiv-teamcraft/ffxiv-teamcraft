export interface LazyCraftingLogPage {
  id:         number;
  masterbook: number | null;
  startLevel: { [key: string]: number };
  recipes:    Recipe[];
}

export interface Recipe {
  recipeId: number;
  itemId:   number;
  rlvl:     number;
}
