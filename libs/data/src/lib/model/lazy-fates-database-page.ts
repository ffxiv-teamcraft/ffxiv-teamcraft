export interface LazyFatesDatabasePage {
  de:          string;
  description: Description;
  en:          string;
  fr:          string;
  icon:        Icon;
  id:          number;
  items?:      number[];
  ja:          string;
  lvl:         number;
  lvlMax:      number;
  patch:       number;
}

export interface Description {
  de: string;
  en: string;
  fr: string;
  ja: string;
}

export enum Icon {
  Empty = "",
  I060000060507PNG = "/i/060000/060507.png",
}
