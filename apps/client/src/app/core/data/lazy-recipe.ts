export interface LazyRecipe {
  id: number;
  yields: number;
  job: number;
  result: number;
  level: number;
  stars: number;
  qs: boolean;
  rlvl: number;
  ingredients: { id: number; amount: number }[];
}
