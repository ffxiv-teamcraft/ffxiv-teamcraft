export interface LazyTerritoryLayer {
  mapId: number;
  index: number;
  placeNameId: number;
  bounds: Bounds;
  ignored?: boolean;
}

export interface Bounds {
  x: X;
  y: X;
  z: X;
}

export interface X {
  min: number;
  max: number;
}
