export interface LazyItemSearch {
  amount?:      number;
  bonuses?:     Bonus[];
  category?:    number;
  clvl?:        number;
  contentType?: LazyItemSearchContentType;
  craftJob?:    number;
  craftable?:   boolean;
  data?:        Data;
  de?:          string;
  elvl?:        number;
  en?:          string;
  fr?:          string;
  icon?:        string;
  id:           number | string;
  ilvl?:        number;
  itemId?:      number;
  ja?:          string;
  ko?:          Ko;
  patch?:       number;
  recipe?:      LazyItemSearchRecipe;
  stats?:       Stat[];
  zh?:          Zh;
}

export interface Bonus {
  HQ:       number;
  ID:       number;
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

export interface Ko {
  ko: string;
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

export interface Stat {
  HQ?: number;
  ID:  number;
  NQ:  number;
}

export interface Zh {
  zh: string;
}
