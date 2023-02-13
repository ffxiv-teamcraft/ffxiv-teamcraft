export interface TerritoryLayer {
  mapId: number;
  index: number;
  placeNameId: number;
  ignored?: boolean;
  bounds: { x: number, y: number, z: number, min: number, max: number };
}
