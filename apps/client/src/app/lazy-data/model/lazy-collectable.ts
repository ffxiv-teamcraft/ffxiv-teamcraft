export interface LazyCollectable {
  collectable?: number;
  level:        number;
  levelMin?:    number;
  levelMax?:    number;
  group?:       number;
  shopId?:      number;
  reward:       number;
  base:         Base;
  mid:          Base;
  high:         Base;
  hwd?:         boolean;
}

export interface Base {
  rating: number;
  exp:    number;
  scrip:  number;
}
