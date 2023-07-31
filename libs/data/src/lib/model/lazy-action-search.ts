export interface LazyActionSearch {
  data:  Data;
  de:    string;
  en:    string;
  fr:    string;
  id:    string;
  ja:    string;
  job:   number;
  ko?:   string;
  lvl:   number;
  patch: number;
  zh?:   string;
}

export interface Data {
  icon:  string;
  id:    number;
  job:   number;
  level: number;
}
