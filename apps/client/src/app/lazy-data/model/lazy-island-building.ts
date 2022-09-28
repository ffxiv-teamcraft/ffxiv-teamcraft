export interface LazyIslandBuilding {
  key:         string;
  icon:        string;
  en:          string;
  de:          string;
  ja:          string;
  fr:          string;
  ingredients: Ingredient[];
}

export interface Ingredient {
  id:     number;
  amount: number;
}
