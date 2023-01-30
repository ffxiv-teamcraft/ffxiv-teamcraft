export interface LazyShopsByNpc {
  gc?:            number;
  id:             number;
  npcs:           number[];
  topicSelectId?: number;
  trades:         Trade[];
  type:           Type;
}

export interface Trade {
  currencies:      Currency[];
  items:           Currency[];
  requiredGCRank?: number;
}

export interface Currency {
  amount: number;
  hq?:    boolean;
  id:     number;
}

export enum Type {
  GCShop = "GCShop",
  GilShop = "GilShop",
  SpecialShop = "SpecialShop",
}
