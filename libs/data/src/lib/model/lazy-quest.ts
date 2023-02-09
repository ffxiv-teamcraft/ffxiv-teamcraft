export interface LazyQuest {
  icon:     string;
  name:     Name;
  rewards?: Reward[];
  trades?:  Trade[];
}

export interface Name {
  de: string;
  en: string;
  fr: string;
  ja: string;
}

export interface Reward {
  amount: number;
  hq?:    boolean;
  id:     number;
}

export interface Trade {
  currencies: Currency[];
  items:      Currency[];
}

export interface Currency {
  amount: number;
  id:     number;
}
