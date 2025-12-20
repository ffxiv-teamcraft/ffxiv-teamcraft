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
  icon: string;
  id:   number;
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
  ko:          string;
  zh:          string;
}
