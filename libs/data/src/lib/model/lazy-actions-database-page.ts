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
  I210000210365PNG = "/i/210000/210365.png",
  I210000210410PNG = "/i/210000/210410.png",
  I210000210460PNG = "/i/210000/210460.png",
  I210000210461PNG = "/i/210000/210461.png",
  I212000212579PNG = "/i/212000/212579.png",
  I212000212590PNG = "/i/212000/212590.png",
  I213000213758PNG = "/i/213000/213758.png",
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
