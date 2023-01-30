export interface LazyTreasure {
  coords:    Coords;
  id:        string;
  item:      number;
  map:       number;
  partySize: number;
  rawCoords: Coords;
}

export interface Coords {
  x: number;
  y: number;
  z: number;
}
