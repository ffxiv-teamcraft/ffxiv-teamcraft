export interface LazyMonster {
  baseid: number;
  positions: Position[];
}

export interface Position {
  map: number;
  zoneid: number;
  level: number;
  hp: number;
  fate: number;
  x: number;
  y: number;
  z: number;
}
