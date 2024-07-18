export interface LazyItemSearch {
  bonuses?:     { [key: string]: Bonus };
  bpvSpecial?:  number[];
  category?:    number;
  cjc?:         { [key: string]: number };
  clvl?:        number;
  collectible?: boolean | number;
  craftJob?:    number;
  craftable?:   boolean;
  data:         Data;
  de:           string;
  delay?:       number;
  desynth?:     number;
  elvl?:        number;
  en:           string;
  fr:           string;
  icon?:        string;
  iconId?:      string;
  id:           number | string;
  ilvl?:        number;
  itemId?:      number;
  ja:           string;
  ko?:          string;
  mDef?:        number;
  mDmg?:        number;
  pDef?:        number;
  pDmg?:        number;
  patch?:       number;
  repair?:      number;
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

export interface Data {
  amount:      number;
  contentType: ContentType;
  icon:        string;
  ilvl?:       number;
  itemId:      number;
  recipe?:     Recipe;
}

export enum ContentType {
  IslandBuildings = "islandBuildings",
  IslandLandmarks = "islandLandmarks",
  Items = "items",
}

export interface Recipe {
  collectible?:    boolean | number;
  icon?:           string;
  isIslandRecipe?: boolean;
  itemId:          number;
  job:             number;
  lvl:             number;
  recipeId:        string;
  stars?:          number;
}
