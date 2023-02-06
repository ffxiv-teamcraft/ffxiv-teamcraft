export interface LazyRetainerTask {
  category:     number;
  cost:         number;
  exp:          number;
  id:           number;
  item:         number;
  lvl:          number;
  quantities:   Quantity[];
  reqGathering: number;
  reqIlvl:      number;
}

export interface Quantity {
  quantity: number;
  stat:     Stat;
  value?:   number;
}

export enum Stat {
  Ilvl = "ilvl",
  Perception = "perception",
}
