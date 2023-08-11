export interface LazyGcSupply {
  count:  number;
  itemId: number;
  reward: Reward;
}

export interface Reward {
  seals: number;
  xp:    number;
}
