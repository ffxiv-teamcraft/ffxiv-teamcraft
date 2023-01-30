export interface LazyGatheringLogPage {
  id:         number;
  items:      Item[];
  startLevel: number;
}

export interface Item {
  hidden: number;
  ilvl:   number;
  itemId: number;
  lvl:    number;
  stars:  number;
}
