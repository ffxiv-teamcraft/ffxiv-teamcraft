export interface LazyActionsDatabasePage {
  affectsPosition?:  boolean;
  cast?:             number;
  category?:         number;
  cdGroup?:          number;
  combo?:            number;
  de?:               string;
  description:       Description;
  effectRange?:      number;
  en:                string;
  fr?:               string;
  fromQuest?:        number;
  icon:              string;
  id:                number;
  ja?:               string;
  job?:              number;
  ko?:               string;
  level?:            number;
  patch:             number;
  playerAction?:     boolean;
  preservesCombo?:   boolean;
  primaryCostType?:  number;
  primaryCostValue?: number;
  procStatus?:       ProcStatus;
  range?:            number;
  recast?:           number;
  target?:           Target;
  traits?:           Trait[];
  zh?:               string;
}

export interface Description {
  de?: string;
  en?: string;
  fr?: string;
  ja?: string;
  ko?: string;
  zh?: string;
}

export interface ProcStatus {
  icon: Icon;
  id:   number;
}

export enum Icon {
  Empty = "",
  I000000000010PNG = "/i/000000/000010.png",
  I000000000100PNG = "/i/000000/000100.png",
  I029000029469PNG = "/i/029000/029469.png",
  I029000029470PNG = "/i/029000/029470.png",
  I029000029499PNG = "/i/029000/029499.png",
  I039000039186PNG = "/i/039000/039186.png",
}

export interface Target {
  hostile: boolean;
  party:   boolean;
  self:    boolean;
}

export interface Trait {
  de:          string;
  description: Description;
  en:          string;
  fr:          string;
  icon:        string;
  id:          number;
  ja:          string;
  ko?:         string;
  zh?:         string;
}
