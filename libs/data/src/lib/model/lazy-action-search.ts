export interface LazyActionSearch {
  data: Data;
  de:   string;
  en:   string;
  fr:   string;
  id:   string;
  ja:   string;
  job:  number;
  ko?:  Ko;
  lvl:  number;
  zh?:  Zh;
}

export interface Data {
  icon:  string;
  id:    string;
  job:   number;
  level: number;
}

export interface Ko {
  ko: string;
}

export interface Zh {
  zh: string;
}
