export interface LazyRecipesIngredientLookup {
  searchIndex: { [key: string]: number[] };
  recipes:     { [key: string]: Recipe };
}

export interface Recipe {
  itemId:      number;
  recipeId:    number;
  ingredients: Ingredient[];
  yields:      number;
  lvl:         number;
  job:         number;
  stars:       number;
}

export interface Ingredient {
  id:      number;
  amount:  number;
  quality: number | null;
}
