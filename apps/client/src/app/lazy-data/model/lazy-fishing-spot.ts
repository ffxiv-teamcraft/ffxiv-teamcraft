export interface LazyFishingSpot {
  id:       number;
  mapId:    number;
  placeId:  number;
  zoneId:   number;
  level:    number;
  category: number;
  coords?:  Coords;
  fishes:   number[];
}

export interface Coords {
  x: number;
  y: number;
}
