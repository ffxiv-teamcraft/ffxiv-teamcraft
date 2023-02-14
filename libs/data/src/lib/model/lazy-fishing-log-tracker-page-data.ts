export interface LazyFishingLogTrackerPageData {
  done:  number;
  tabs:  Tab[];
  total: number;
}

export interface Tab {
  done:    number;
  id:      number;
  mapId:   number;
  placeId: number;
  spots:   Spot[];
  total:   number;
}

export interface Spot {
  coords:  SpotCoords;
  done:    number;
  fishes:  Fish[];
  id:      number;
  mapId:   number;
  placeId: number;
  total:   number;
}

export interface SpotCoords {
  x: number;
  y: number;
}

export interface Fish {
  data:       Datum[];
  icon?:      string;
  id:         number;
  itemId:     number;
  level:      number;
  timed?:     boolean | number;
  weathered?: number;
}

export interface Datum {
  alarms:        Alarm[];
  gatheringNode: GatheringNode;
}

export interface Alarm {
  areaId:       number;
  baits?:       Bait[];
  coords:       AlarmCoords;
  duration:     number;
  ephemeral:    boolean;
  fishEyes?:    boolean;
  folklore?:    number;
  hookset?:     number;
  itemId:       number;
  mapId:        number;
  nodeContent:  number[];
  nodeId:       number;
  predators:    Predator[];
  reduction:    boolean;
  shadowSize?:  number;
  snagging:     boolean;
  spawns:       number[];
  speed?:       number;
  type:         number;
  weathers:     number[];
  weathersFrom: number[];
  zoneId:       number;
}

export interface Bait {
  id:   number;
  tug?: number;
}

export interface AlarmCoords {
  x: number;
  y: number;
  z: number;
}

export interface Predator {
  amount: number;
  id:     number;
}

export interface GatheringNode {
  baits?:            Bait[];
  duration:          number;
  ephemeral:         boolean;
  folklore?:         number;
  hookset?:          number;
  id:                number;
  items:             number[];
  legendary:         boolean;
  level:             number;
  limited:           boolean;
  map:               number;
  matchingItemId:    number;
  minGathering?:     number;
  oceanFishingTime?: number | null;
  predators?:        Predator[];
  shadowSize?:       number;
  snagging?:         boolean;
  spawns:            number[];
  speed?:            number;
  tug?:              number;
  type:              number;
  weathers?:         number[];
  weathersFrom?:     number[];
  x:                 number;
  y:                 number;
  z:                 number;
  zoneId:            number;
}
