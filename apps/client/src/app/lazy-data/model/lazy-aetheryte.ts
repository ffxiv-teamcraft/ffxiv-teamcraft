export interface LazyAetheryte {
  id: number;
  zoneid: number;
  map: number;
  x: number;
  y: number;
  z: number;
  type: number;
  nameid: number;
  aethernetCoords: AethernetCoords;
}

export interface AethernetCoords {
  x?: number;
  y?: number;
}
