export interface LazyIslandLandmark {
  "-11010": The110;
  "-11020": The110;
  "-11030": The110;
  "-11040": The110;
  "-11050": The110;
}

export interface The110 {
  key:         number;
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
