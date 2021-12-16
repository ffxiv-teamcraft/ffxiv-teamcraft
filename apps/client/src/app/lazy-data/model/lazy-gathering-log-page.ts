export interface LazyGatheringLogPage {
  id: number;
  startLevel: number;
  items: Item[];
}

export interface Item {
  itemId: number;
  ilvl: number;
  lvl: number;
  stars: number;
  hidden: number;
}
