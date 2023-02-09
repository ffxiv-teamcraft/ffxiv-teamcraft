export interface LazyFishingSpot {
  category: number;
  coords?:  Coords;
  fishes:   number[];
  id:       number;
  level:    number;
  mapId:    number;
  placeId:  number;
  zoneId:   number;
}

export interface Coords {
  x: number;
  y: number;
}
