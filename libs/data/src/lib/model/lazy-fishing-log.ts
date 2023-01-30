export interface LazyFishingLog {
  category: number;
  icon:     string;
  itemId:   number;
  level:    number;
  mapId:    number;
  placeId:  number;
  spot:     Spot;
  zoneId:   number;
}

export interface Spot {
  coords: Coords;
  id:     number;
}

export interface Coords {
  x: number;
  y: number;
}
