export interface LazyQuestsDatabasePage {
  action?:       number;
  banner?:       string;
  beastRank:     number;
  chainLength:   number;
  de:            string;
  description:   Description;
  en:            string;
  end:           number;
  fr:            string;
  genre:         number;
  icon:          string;
  id:            number;
  ja:            string;
  jobCategory:   number;
  ko?:           string;
  level:         number;
  next:          number[];
  npcs:          number[];
  patch:         number;
  repeatable:    boolean;
  requires:      number[];
  rewards:       Reward[];
  start:         number;
  startingPoint: StartingPoint | null;
  trades?:       Trade[];
  zh?:           string;
}

export interface Description {
  de?: string;
  en?: string;
  fr?: string;
  ja?: string;
  ko?: string;
  zh?: string;
}

export interface Reward {
  amount?: number;
  hq?:     boolean;
  id?:     number;
  type:    Type;
}

export enum Type {
  Action = "action",
  Instance = "instance",
  Item = "item",
  Rep = "rep",
}

export interface StartingPoint {
  map:    number;
  x:      number;
  y:      number;
  z:      number;
  zoneid: number;
}

export interface Trade {
  currencies: Currency[];
  items:      Currency[];
}

export interface Currency {
  amount: number;
  id:     number;
}
