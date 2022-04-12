export interface LazyLeve {
  en:    string;
  ja:    string;
  de:    string;
  fr:    string;
  job:   Job;
  lvl:   number;
  items: Item[];
}

export interface Item {
  itemId: number;
  amount: number;
}

export interface Job {
  en: null | string;
  ja: null | string;
  de: null | string;
  fr: null | string;
}
