export interface LazyRecipesIngredientLookup {
  recipes:     { [key: string]: Recipe };
  searchIndex: { [key: string]: number[] };
}

export interface Recipe {
  ingredients: Ingredient[];
  itemId:      number;
  job:         number;
  lvl:         number;
  recipeId:    number;
  stars:       number;
  yields:      number;
}

export interface Ingredient {
  amount:  number;
  id:      number;
  quality: number;
}
