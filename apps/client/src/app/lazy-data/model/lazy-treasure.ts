export interface LazyTreasure {
  id: string;
  coords: Coords;
  rawCoords: Coords;
  map: number;
  partySize: number;
  item: number;
}

export interface Coords {
  x: number;
  y: number;
  z: number;
}
