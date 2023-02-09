export interface LazyMonster {
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
