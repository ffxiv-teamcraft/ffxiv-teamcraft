export interface LazyRetainerTask {
  id: number;
  exp: number;
  reqGathering: number;
  reqIlvl: number;
  lvl: number;
  cost: number;
  item: number;
  quantities: Quantity[];
  category: number;
}

export interface Quantity {
  quantity: number;
  stat: Stat;
  value?: number;
}

export enum Stat {
  Ilvl = 'ilvl',
  Perception = 'perception',
}
