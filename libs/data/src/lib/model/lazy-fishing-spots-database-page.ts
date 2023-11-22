export interface LazyFishingSpotsDatabasePage {
  category:      number;
  categoryLabel: CategoryLabel;
  coords?:       Coords;
  de:            string;
  en:            string;
  fishes:        number[];
  fr:            string;
  id:            number;
  ja:            string;
  ko:            string;
  level:         number;
  mapId:         number;
  patch:         number;
  placeId:       number;
  radius:        number;
  weatherRate:   number;
  zh:            string;
  zoneId:        number;
}

export enum CategoryLabel {
  AetherochemicalPool = "Aetherochemical pool",
  Clouds = "Clouds",
  Dune = "Dune",
  Freshwater = "Freshwater",
  Magma = "Magma",
  SaltLake = "Salt Lake",
  Saltwater = "Saltwater",
  Sky = "Sky",
  Space = "Space",
}

export interface Coords {
  x: number;
  y: number;
}
