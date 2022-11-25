export interface LazyQuest {
  name:     Name;
  icon:     string;
  rewards?: Reward[];
  trades?:  Trade[];
}

export interface Name {
  en: string;
  ja: string;
  de: string;
  fr: string;
}

export interface Reward {
  id:     number;
  amount: number;
  hq?:    boolean;
}

export interface Trade {
  currencies: Currency[];
  items:      Currency[];
}

export interface Currency {
  id:     number;
  amount: number;
}
