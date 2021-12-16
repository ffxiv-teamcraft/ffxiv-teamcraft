export interface LazyGatheringBonus {
  value: number;
  conditionValue: number;
  bonus?: Bonus;
  condition?: Bonus;
}

export interface Bonus {
  en: string;
  de: string;
  ja: string;
  fr: string;
}
