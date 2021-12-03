export interface LazyNpc {
  en:           string;
  ja:           string;
  de:           string;
  fr:           string;
  defaultTalks: number[];
  position?:    Position;
  festival?:    number;
}

export interface Position {
  zoneid: number;
  map:    number;
  x:      null;
  y:      null;
  z:      null;
}
