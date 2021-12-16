export interface LazyFishingSpot {
  id: number;
  mapId: number;
  placeId: number;
  zoneId: number;
  level: number;
  coords?: Coords;
  fishes: number[];
}

export interface Coords {
  x: number;
  y: number;
}
