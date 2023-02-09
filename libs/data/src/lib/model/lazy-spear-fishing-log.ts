export interface LazySpearFishingLog {
  coords:  Coords;
  id:      number;
  itemId:  number;
  mapId:   number;
  placeId: number;
  zoneId:  number;
}

export interface Coords {
  x: number;
  y: number;
}
