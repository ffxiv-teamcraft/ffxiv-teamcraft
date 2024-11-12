export interface LazyFateSearch {
  data:  Data;
  de:    string;
  en:    string;
  fr:    string;
  id:    number;
  ja:    string;
  patch: number;
}

export interface Data {
  icon:  Icon;
  id:    string;
  level: number;
}

export enum Icon {
  Empty = "",
  I060000060507PNG = "/i/060000/060507.png",
}
