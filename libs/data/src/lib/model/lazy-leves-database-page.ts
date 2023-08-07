export interface LazyLevesDatabasePage {
  battleItems?: BattleItem[];
  cost:         number;
  de:           string;
  description:  Description;
  en:           string;
  enemies?:     Enemy[];
  exp:          number;
  fr:           string;
  genre:        number;
  gil:          number;
  icon:         string;
  id:           number;
  items?:       Item[];
  ja:           string;
  ko?:          string;
  level:        number;
  npcs:         Npc[];
  repeats:      number;
  rewards:      any[];
  zh?:          string;
}

export interface BattleItem {
  amount:   number;
  dropRate: number;
  icon:     string;
  id:       number;
  name:     Description;
}

export interface Description {
  de:    string;
  en:    string;
  fr:    string;
  icon?: string;
  id?:   string;
  ja:    string;
  ko?:   string;
  zh?:   string;
}

export interface Enemy {
  id:    number;
  level: number;
}

export interface Item {
  amount: number;
  id:     number;
}

export interface Npc {
  client: boolean;
  id:     number;
  issuer: boolean;
}
