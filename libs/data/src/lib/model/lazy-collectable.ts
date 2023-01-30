export interface LazyCollectable {
  base:         Base;
  collectable?: number;
  group?:       number;
  high:         Base;
  hwd?:         boolean;
  level:        number;
  levelMax?:    number;
  levelMin?:    number;
  mid:          Base;
  reward?:      number;
  shopId?:      number;
}

export interface Base {
  exp:    number;
  rating: number;
  scrip:  number;
}
