export interface LazyFishingLog {
  itemId:   number;
  level:    number;
  icon:     string;
  mapId:    number;
  placeId:  number;
  zoneId:   number;
  category: number;
  spot:     Spot;
}

export interface Spot {
  id:     number;
  coords: Coords;
}

export interface Coords {
  x: number;
  y: number;
}
