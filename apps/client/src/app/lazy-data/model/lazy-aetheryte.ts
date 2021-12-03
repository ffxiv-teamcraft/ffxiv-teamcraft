export interface LazyAetheryte {
  id:              number;
  zoneid:          number;
  map:             number;
  x:               null;
  y:               null;
  z:               null;
  type:            number;
  nameid:          number;
  aethernetCoords: AethernetCoords;
}

export interface AethernetCoords {
  x?: number;
  y?: number;
}
