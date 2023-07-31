export interface LazyItemSearch {
  amount?:      number;
  bonuses?:     { [key: string]: Bonus };
  category?:    number;
  cjc?:         { [key: string]: number };
  clvl?:        number;
  collectible?: number;
  contentType?: LazyItemSearchContentType;
  craftJob?:    number;
  craftable?:   boolean;
  data?:        Data;
  de?:          string;
  delay?:       number;
  elvl?:        number;
  en?:          string;
  fr?:          string;
  icon?:        string;
  id:           number | string;
  ilvl?:        number;
  itemId?:      number;
  ja?:          string;
  ko?:          string;
  mDef?:        number;
  mDmg?:        number;
  pDef?:        number;
  pDmg?:        number;
  patch?:       number;
  recipe?:      LazyItemSearchRecipe;
  stats?:       { [key: string]: number };
  zh?:          string;
}

export interface Bonus {
  HQ:       number;
  Max?:     number;
  MaxHQ?:   number;
  NQ:       number;
  Relative: boolean;
}

export enum LazyItemSearchContentType {
  IslandBuildings = "islandBuildings",
  IslandLandmarks = "islandLandmarks",
}

export interface Data {
  amount:      number;
  contentType: DataContentType;
  icon:        string;
  itemId:      number;
  recipe?:     DataRecipe;
}

export enum DataContentType {
  Items = "items",
}

export interface DataRecipe {
  collectible?: number;
  itemId:       number;
  job:          number;
  lvl:          number;
  recipeId:     string;
  stars?:       number;
}

export interface LazyItemSearchRecipe {
  collectible: boolean;
  icon:        string;
  itemId:      number;
  job:         number;
  lvl:         number;
  recipeId:    string;
  stars:       number;
}
