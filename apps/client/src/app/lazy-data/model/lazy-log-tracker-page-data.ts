export interface LazyLogTrackerPageData {
  id:                     number;
  masterbook?:            null;
  startLevel:             number | { [key: string]: number };
  recipes?:               Recipe[];
  divisionId:             number;
  requiredForAchievement: boolean;
  items?:                 Item[];
}

export interface Item {
  itemId: number;
  ilvl:   number;
  lvl:    number;
  stars:  number;
  hidden: number;
  nodes:  Node[];
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
  spawns:       number[];
  reduction:    boolean;
  ephemeral:    boolean;
  nodeContent:  number[];
  weathers:     any[];
  weathersFrom: any[];
  snagging:     boolean;
  predators:    any[];
  note:         string;
  enabled:      boolean;
  folklore?:    number;
}

export interface Coords {
  x: number;
  y: number;
  z: number;
}

export interface GatheringNode {
  items:                 number[];
  limited:               boolean;
  level:                 number;
  type:                  number;
  legendary:             boolean;
  ephemeral:             boolean;
  spawns:                number[];
  duration:              number;
  x:                     number;
  y:                     number;
  z:                     number;
  map:                   number;
  id:                    number;
  zoneId:                number;
  matchingItemId:        number;
  hiddenItems?:          number[];
  matchingItemIsHidden?: boolean;
  folklore?:             number;
}

export interface Recipe {
  recipeId: number;
  itemId:   number;
  rlvl:     number;
  leves:    number[];
}
