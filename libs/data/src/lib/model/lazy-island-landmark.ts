export interface LazyIslandLandmark {
  de:          string;
  en:          string;
  fr:          string;
  icon:        string;
  ingredients: Ingredient[];
  ja:          string;
  key:         number;
}

export interface Ingredient {
  amount: number;
  id:     number;
}
