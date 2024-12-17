export interface LazyInstanceSearch {
  data:  Data;
  de:    string;
  en:    string;
  fr:    string;
  id:    number;
  ja:    string;
  ko?:   string;
  lvl:   number;
  patch: number;
  zh?:   string;
}

export interface Data {
  banner: string;
  icon:   Icon;
  id:     number;
  level:  number;
}

export enum Icon {
  I061000061801PNG = "/i/061000/061801.png",
  I061000061802PNG = "/i/061000/061802.png",
  I061000061803PNG = "/i/061000/061803.png",
  I061000061804PNG = "/i/061000/061804.png",
  I061000061805PNG = "/i/061000/061805.png",
  I061000061806PNG = "/i/061000/061806.png",
  I061000061808PNG = "/i/061000/061808.png",
  I061000061815PNG = "/i/061000/061815.png",
  I061000061820PNG = "/i/061000/061820.png",
  I061000061823PNG = "/i/061000/061823.png",
  I061000061824PNG = "/i/061000/061824.png",
  I061000061832PNG = "/i/061000/061832.png",
  I061000061836PNG = "/i/061000/061836.png",
  I061000061846PNG = "/i/061000/061846.png",
  I061000061850PNG = "/i/061000/061850.png",
}
