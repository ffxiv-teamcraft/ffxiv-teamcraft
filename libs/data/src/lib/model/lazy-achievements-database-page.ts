export interface LazyAchievementsDatabasePage {
  de:          string;
  description: Description;
  en:          string;
  fr:          string;
  icon:        string;
  id:          number;
  item:        number;
  ja:          string;
  ko?:         string;
  patch:       number;
  title:       number;
  zh?:         string;
}

export interface Description {
  de:  string;
  en:  string;
  fr:  string;
  ja:  string;
  ko?: string;
  zh?: string;
}
