export interface LazyTraitsDatabasePage {
  actions:     number[];
  classJob:    number;
  de:          string;
  description: Description;
  en:          string;
  fr:          string;
  icon:        string;
  id:          number;
  ja:          string;
  ko?:         string;
  level:       number;
  patch:       number;
  quest?:      Quest;
  zh?:         string;
}

export interface Description {
  de?: string;
  en?: string;
  fr?: string;
  ja?: string;
  ko?: string;
  zh?: string;
}

export interface Quest {
  icon: string;
  id:   number;
}
