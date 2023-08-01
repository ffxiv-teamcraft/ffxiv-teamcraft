export interface LazyStatusSearch {
  data:  Data;
  de:    string;
  en:    string;
  fr:    string;
  id:    number;
  ja:    string;
  ko?:   string;
  patch: number;
  zh?:   string;
}

export interface Data {
  description: Description;
  icon:        string;
  id:          string;
}

export interface Description {
  de:  string;
  en:  string;
  fr:  string;
  ja:  string;
  ko?: string;
  zh?: string;
}
