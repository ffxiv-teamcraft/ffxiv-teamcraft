export interface LazyShop {
  id:             number;
  type:           Type;
  npcs:           number[];
  trades:         Trade[];
  topicSelectId?: number;
  gc?:            number;
}

export interface Trade {
  currencies:      Currency[];
  items:           Currency[];
  requiredGCRank?: number;
}

export interface Currency {
  id:     number;
  amount: number;
  hq?:    boolean;
}

export enum Type {
  GCShop = "GCShop",
  GilShop = "GilShop",
  SpecialShop = "SpecialShop",
}
