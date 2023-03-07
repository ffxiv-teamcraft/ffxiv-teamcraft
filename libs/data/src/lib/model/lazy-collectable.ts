export interface LazyCollectable {
  base:         Base;
  collectable?: number;
  group?:       number;
  high:         Base;
  hwd?:         boolean;
  id:           number;
  level:        number;
  levelMax?:    number;
  levelMin?:    number;
  mid:          Base;
  reward:       number;
  rewardType?:  number;
  shopId?:      number;
  type:         Type;
}

export interface Base {
  exp:       number;
  quantity?: number;
  rating:    number;
  scrip:     number;
}

export enum Type {
  CollectablesShopItem = "CollectablesShopItem",
  HWDCrafterSupply = "HWDCrafterSupply",
}
