export interface LazyIslandBuilding {
  de:          string;
  en:          string;
  fr:          string;
  icon:        string;
  ingredients: Ingredient[];
  ja:          string;
  key:         string;
}

export interface Ingredient {
  amount: number;
  id:     number;
}
