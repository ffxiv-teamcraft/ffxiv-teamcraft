export interface LazyTerritoryLayer {
  bounds:      Bounds;
  ignored?:    boolean;
  index:       number;
  mapId:       number;
  placeNameId: number;
}

export interface Bounds {
  x: X;
  y: X;
  z: X;
}

export interface X {
  max: number;
  min: number;
}
