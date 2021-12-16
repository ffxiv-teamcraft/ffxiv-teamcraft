export interface LazySpearFishingLog {
  id: number;
  itemId: number;
  mapId: number;
  placeId: number;
  zoneId: number;
  coords: Coords;
}

export interface Coords {
  x: number;
  y: number;
}
