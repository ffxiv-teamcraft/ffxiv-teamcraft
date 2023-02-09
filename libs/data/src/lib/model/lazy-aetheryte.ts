export interface LazyAetheryte {
  aethernetCoords: AethernetCoords;
  id:              number;
  map:             number;
  nameid:          number;
  type:            number;
  x:               number;
  y:               number;
  z:               number;
  zoneid:          number;
}

export interface AethernetCoords {
  x: number;
  y: number;
}
