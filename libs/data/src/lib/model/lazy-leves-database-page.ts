export interface LazyLevesDatabasePage {
  cost:        number;
  de:          string;
  description: Description;
  en:          string;
  exp:         number;
  fr:          string;
  genre:       number;
  gil:         number;
  icon:        string;
  id:          number;
  ja:          string;
  ko?:         string;
  level:       number;
  npcs:        Npc[];
  repeats:     number;
  rewards:     any[];
  zh?:         string;
}

export interface Description {
  de:  string;
  en:  string;
  fr:  string;
  ja:  string;
  ko?: string;
  zh?: string;
}

export interface Npc {
  client: boolean;
  id:     number;
  issuer: boolean;
}
