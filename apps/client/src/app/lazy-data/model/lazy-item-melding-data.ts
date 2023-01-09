export interface LazyItemMeldingData {
  modifier: number;
  prop:     Prop;
  slots:    number;
  overmeld: boolean;
}

export enum Prop {
  Bracelet = "Bracelet%",
  Chest = "Chest%",
  ChestHead = "ChestHead%",
  ChestHeadLegsFeet = "ChestHeadLegsFeet%",
  Earring = "Earring%",
  Empty = "",
  Feet = "Feet%",
  Hands = "Hands%",
  Head = "Head%",
  Legs = "Legs%",
  LegsFeet = "LegsFeet%",
  Necklace = "Necklace%",
  Oh = "OH%",
  Ring = "Ring%",
  The1HWpn = "1HWpn%",
  The2HWpn = "2HWpn%",
}
