export interface LazyNodesDatabasePage {
  alarms?:       Alarm[];
  base:          number;
  bonuses:       BonusElement[];
  de:            string;
  duration:      number;
  en:            string;
  ephemeral:     boolean;
  folklore?:     number;
  fr:            string;
  hiddenItems?:  number[];
  id:            string;
  items:         Item[];
  ja:            string;
  ko:            string;
  legendary:     boolean;
  level:         number;
  limited:       boolean;
  map:           number;
  patch:         number;
  radius:        number;
  spawns:        number[];
  sublimeItems?: SublimeItem[];
  type:          number;
  x:             number;
  y:             number;
  z:             number;
  zh:            string;
  zoneid:        number;
}

export interface Alarm {
  areaId:       number;
  coords:       Coords;
  duration:     number;
  ephemeral:    boolean;
  folklore?:    number;
  itemId?:      number;
  mapId:        number;
  nodeContent:  number[];
  nodeId:       number;
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

export interface BonusElement {
  bonus:     ConditionClass;
  condition: ConditionClass;
}

export interface ConditionClass {
  de: string;
  en: string;
  fr: string;
  ja: string;
  ko: string;
  zh: string;
}

export interface Item {
  alarms:         Alarm[];
  gatheringItem?: GatheringItem;
  itemId:         number;
}

export interface GatheringItem {
  hidden:         number;
  itemId:         number;
  level:          number;
  perceptionReq:  number;
  stars:          number;
  sublimeVariant: number;
}

export interface SublimeItem {
  source:  number;
  sublime: number;
}
