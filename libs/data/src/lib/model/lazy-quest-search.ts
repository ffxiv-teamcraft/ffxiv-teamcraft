export interface LazyQuestSearch {
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
  banner?: string;
  icon:    string;
  id:      string;
}
