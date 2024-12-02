export interface LazyGatheringNodeSearch {
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
  node: Node;
}

export interface Node {
  base:          number;
  duration:      number;
  ephemeral:     boolean;
  folklore?:     number;
  hiddenItems?:  number[];
  items:         number[];
  legendary:     boolean;
  level:         number;
  limited:       boolean;
  map:           number;
  radius:        number;
  spawns:        number[];
  sublimeItems?: SublimeItem[];
  type:          number;
  x:             number;
  y:             number;
  z:             number;
  zoneid:        number;
}

export interface SublimeItem {
  source:  number;
  sublime: number;
}
