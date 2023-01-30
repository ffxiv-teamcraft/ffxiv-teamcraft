export interface LazyItemSetBonus {
  bonuses:      Bonus[];
  itemSeriesId: number;
}

export interface Bonus {
  amountRequired: number;
  baseParam:      number;
  value:          number;
}
