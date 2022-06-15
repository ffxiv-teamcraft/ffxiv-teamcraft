export interface LazyFishingLogTrackerPageData {
  tabs:  Tab[];
  total: number;
  done:  number;
}

export interface Tab {
  id:      number;
  mapId:   number;
  placeId: number;
  done:    number;
  total:   number;
  spots:   Spot[];
}

export interface Spot {
  id:      number;
  placeId: number;
  mapId:   number;
  done:    number;
  total:   number;
  coords:  SpotCoords;
  fishes:  Fish[];
}

export interface SpotCoords {
  x: number;
  y: number;
}

export interface Fish {
  id:         number;
  itemId:     number;
  level:      number;
  icon?:      string;
  data:       Datum[];
  timed:      boolean | number;
  weathered?: number;
}

export interface Datum {
  gatheringNode: GatheringNode;
  alarms:        Alarm[];
}

export interface Alarm {
  itemId:       number;
  nodeId:       number;
  duration:     number;
  mapId:        number;
  zoneId:       number;
  areaId:       number;
  type:         number;
  coords:       AlarmCoords;
  spawns?:      number[];
  reduction:    boolean;
  ephemeral:    boolean;
  nodeContent:  number[];
  weathers:     number[];
  weathersFrom: number[];
  snagging:     boolean;
  predators:    Predator[];
  note:         string;
  enabled:      boolean;
  baits?:       Bait[];
  hookset?:     number;
  fishEyes?:    boolean;
  folklore?:    number;
  speed?:       number;
  shadowSize?:  number;
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
  id:     number;
  amount: number;
}

export interface GatheringNode {
  id:                number;
  items:             number[];
  level:             number;
  type:              number;
  legendary:         boolean;
  ephemeral:         boolean;
  zoneId:            number;
  map:               number;
  x?:                number;
  y?:                number;
  z:                 number;
  spawns:            number[];
  duration:          number;
  limited:           boolean;
  hookset?:          number;
  tug?:              number;
  snagging?:         boolean;
  baits?:            Bait[];
  oceanFishingTime?: number | null;
  matchingItemId:    number;
  weathers?:         number[];
  weathersFrom?:     number[];
  predators?:        Predator[];
  folklore?:         number;
  speed?:            number;
  shadowSize?:       number;
}
