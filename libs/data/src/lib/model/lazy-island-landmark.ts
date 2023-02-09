export interface LazyIslandLandmark {
  "-11010": The110;
  "-11020": The110;
  "-11030": The110;
  "-11040": The110;
  "-11050": The110;
  "-11060": The110;
}

export interface The110 {
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
