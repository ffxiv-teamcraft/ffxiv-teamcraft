export interface LazyFishingSpotSearch {
  data:  Data;
  de:    string;
  en:    string;
  fr:    string;
  id:    number;
  ja:    string;
  ko:    string;
  patch: number;
  zh:    string;
}

export interface Data {
  id:   number;
  spot: Spot;
}

export interface Spot {
  category: number;
  coords?:  Coords;
  fishes:   number[];
  id:       number;
  level:    number;
  mapId:    number;
  placeId:  number;
  radius:   number;
  zoneId:   number;
}

export interface Coords {
  x: number;
  y: number;
}
