export interface LazyCollectablesPageData {
  groupId:      number;
  collectables: Collectable[];
}

export interface Collectable {
  collectable: number;
  level:       number;
  levelMin:    number;
  levelMax:    number;
  group:       number;
  shopId:      number;
  reward:      number;
  base:        Base;
  mid:         Base;
  high:        Base;
  itemId:      number;
  amount:      number;
  expBase:     number[];
  expMid:      number[];
  expHigh:     number[];
  nodes?:      Node[];
}

export interface Base {
  rating: number;
  exp:    number;
  scrip:  number;
}

export interface Node {
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
  coords:       Coords;
  spawns?:      number[];
  reduction:    boolean;
  ephemeral:    boolean;
  nodeContent:  number[];
  weathers:     number[];
  weathersFrom: any[];
  snagging:     boolean;
  predators:    any[];
  note:         string;
  enabled:      boolean;
  baits?:       Bait[];
  hookset?:     number;
  folklore?:    number;
  fishEyes?:    boolean;
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
  items:             number[];
  limited:           boolean;
  level:             number;
  type:              number;
  legendary:         boolean;
  ephemeral:         boolean;
  spawns:            number[];
  duration:          number;
  x:                 number;
  y:                 number;
  z:                 number;
  map:               number;
  id:                number;
  zoneId:            number;
  matchingItemId:    number;
  hookset?:          number;
  tug?:              number;
  snagging?:         boolean;
  baits?:            Bait[];
  oceanFishingTime?: null;
  folklore?:         number;
  weathers?:         number[];
}
