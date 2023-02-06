export interface LazyCollectablesPageData {
  collectables: Collectable[];
  groupId:      number;
}

export interface Collectable {
  amount:      number;
  base:        Base;
  collectable: number;
  expBase:     number[];
  expHigh:     number[];
  expMid:      number[];
  group:       number;
  high:        Base;
  itemId:      number;
  level:       number;
  levelMax:    number;
  levelMin:    number;
  mid:         Base;
  nodes?:      Node[];
  reward:      number;
  shopId:      number;
}

export interface Base {
  exp:    number;
  rating: number;
  scrip:  number;
}

export interface Node {
  alarms:        Alarm[];
  gatheringNode: GatheringNode;
}

export interface Alarm {
  areaId:       number;
  baits?:       Bait[];
  coords:       Coords;
  duration:     number;
  enabled:      boolean;
  ephemeral:    boolean;
  fishEyes?:    boolean;
  folklore?:    number;
  hookset?:     number;
  itemId:       number;
  mapId:        number;
  nodeContent:  number[];
  nodeId:       number;
  note:         string;
  predators:    any[];
  reduction:    boolean;
  snagging:     boolean;
  spawns?:      number[];
  type:         number;
  weathers:     number[];
  weathersFrom: any[];
  zoneId:       number;
}

export interface Bait {
  id:   number;
  tug?: number;
}

export interface Coords {
  x: number;
  y: number;
  z: number;
}

export interface GatheringNode {
  baits?:            Bait[];
  base?:             number;
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
  oceanFishingTime?: null;
  predators?:        Predator[];
  shadowSize?:       number;
  snagging?:         boolean;
  spawns:            number[];
  speed?:            number;
  tug?:              number;
  type:              number;
  weathers?:         number[];
  x:                 number;
  y:                 number;
  z:                 number;
  zoneId:            number;
}

export interface Predator {
  amount: number;
  id:     number;
}
