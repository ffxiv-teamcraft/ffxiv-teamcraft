export interface LazyStatusesDatabasePage {
  category:     number;
  de:           string;
  description:  Description;
  en:           string;
  fr:           string;
  icon:         string;
  id:           number;
  ja:           string;
  ko?:          string;
  lockActions:  boolean;
  lockControl:  boolean;
  lockMovement: boolean;
  patch:        number;
  stacks:       number;
  zh?:          string;
}

export interface Description {
  de:  string;
  en:  string;
  fr:  string;
  ja:  string;
  ko?: string;
  zh?: string;
}
