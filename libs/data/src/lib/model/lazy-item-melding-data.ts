export interface LazyItemMeldingData {
  modifier: number;
  overmeld: boolean;
  prop:     Prop;
  slots:    number;
}

export enum Prop {
  BraceletPercent = "BraceletPercent",
  ChestHeadLegsFeetPercent = "ChestHeadLegsFeetPercent",
  ChestHeadPercent = "ChestHeadPercent",
  ChestPercent = "ChestPercent",
  EarringPercent = "EarringPercent",
  Empty = "",
  FeetPercent = "FeetPercent",
  HandsPercent = "HandsPercent",
  HeadPercent = "HeadPercent",
  LegsFeetPercent = "LegsFeetPercent",
  LegsPercent = "LegsPercent",
  NecklacePercent = "NecklacePercent",
  OffHandPercent = "OffHandPercent",
  OneHandWeaponPercent = "OneHandWeaponPercent",
  RingPercent = "RingPercent",
  TwoHandWeaponPercent = "TwoHandWeaponPercent",
}
