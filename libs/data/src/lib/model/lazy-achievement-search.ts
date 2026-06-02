export interface LazyAchievementSearch {
  data:  Data;
  de:    string;
  en:    string;
  fr:    string;
  id:    number;
  ja:    string;
  ko?:   string;
  patch: number;
  tw?:   string;
  zh?:   string;
}

export interface Data {
  icon: string;
  id:   string;
}
