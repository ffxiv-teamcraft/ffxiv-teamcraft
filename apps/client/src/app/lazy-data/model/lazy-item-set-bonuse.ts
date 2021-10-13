export interface LazyItemSetBonuse {
  itemSeriesId: number;
  bonuses:      Bonus[];
}

export interface Bonus {
  baseParam:      number;
  value:          number;
  amountRequired: number;
}
