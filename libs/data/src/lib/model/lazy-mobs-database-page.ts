export interface LazyMobsDatabasePage {
  de:       string;
  drops:    number[];
  en:       string;
  fr:       string;
  id:       string;
  ja:       string;
  ko?:      string;
  monster?: Monster;
  patch:    number;
  zh?:      string;
}

export interface Monster {
  baseid:    number;
  positions: Position[];
}

export interface Position {
  fate:   number;
  hp:     number;
  level:  number;
  map:    number;
  x:      number;
  y:      number;
  z:      number;
  zoneid: number;
}
