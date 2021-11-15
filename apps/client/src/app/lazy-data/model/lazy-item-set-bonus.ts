export interface LazyItemSetBonus {
  itemSeriesId: number;
  bonuses:      Bonus[];
}

export interface Bonus {
  baseParam:      number;
  value:          number;
  amountRequired: number;
}
