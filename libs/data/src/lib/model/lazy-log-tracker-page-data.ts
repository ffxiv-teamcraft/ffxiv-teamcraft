export interface LazyLogTrackerPageData {
  divisionId:             number;
  id:                     number;
  items?:                 Item[];
  masterbook?:            number | null;
  recipes?:               Recipe[];
  requiredForAchievement: boolean;
  startLevel:             number;
}

export interface Item {
  hidden: number;
  ilvl:   number;
  itemId: number;
  lvl:    number;
  nodes:  Node[];
  stars:  number;
}

export interface Node {
  alarms:        Alarm[];
  gatheringNode: GatheringNode;
}

export interface Alarm {
  areaId:       number;
  coords:       Coords;
  duration:     number;
  enabled:      boolean;
  ephemeral:    boolean;
  folklore?:    number;
  itemId:       number;
  mapId:        number;
  nodeContent:  number[];
  nodeId:       number;
  note:         string;
  predators:    any[];
  reduction:    boolean;
  snagging:     boolean;
  spawns:       number[];
  type:         number;
  weathers:     any[];
  weathersFrom: any[];
  zoneId:       number;
}

export interface Coords {
  x: number;
  y: number;
  z: number;
}

export interface GatheringNode {
  base:                  number;
  duration:              number;
  ephemeral:             boolean;
  folklore?:             number;
  hiddenItems?:          number[];
  id:                    number;
  items:                 number[];
  legendary:             boolean;
  level:                 number;
  limited:               boolean;
  map:                   number;
  matchingItemId:        number;
  matchingItemIsHidden?: boolean;
  spawns:                number[];
  type:                  number;
  x:                     number;
  y:                     number;
  z:                     number;
  zoneId:                number;
}

export interface Recipe {
  itemId:   number;
  leves:    number[];
  recipeId: number;
  rlvl:     number;
}
