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
  name:          Name;
  next:          Next[];
  npcs:          number[];
  patch:         number;
  repeatable:    boolean;
  requires:      number[];
  rewards:       Reward[];
  start:         number;
  startingPoint: StartingPoint | null;
  text:          Text;
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

export interface Name {
  de?: string;
  en?: string;
  fr?: string;
  ja?: string;
}

export interface Next {
  ActionReward:          number;
  ActorSpawnSeq:         number[];
  BeastReputationRank:   number;
  ClassJobCategory0:     number;
  ClassJobLevel0:        number;
  GilReward:             number;
  GrandCompany:          number;
  Id:                    string;
  Id_de:                 string;
  Id_en:                 string;
  Id_fr:                 string;
  Id_ja:                 string;
  InstanceContentUnlock: number;
  IsRepeatable:          boolean;
  IssuerStart:           number;
  JournalGenre:          number;
  PreviousQuest:         number[];
  ReputationReward:      number;
  TargetEnd:             number;
  __sheet:               Sheet;
  index:                 number;
  subIndex:              number;
}

export enum Sheet {
  Quest = "Quest",
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

export interface Text {
  Dialogue?: Dialogue[];
  Journal?:  Journal[];
  ToDo?:     Journal[];
}

export interface Dialogue {
  npc:   number | null;
  order: number;
  text:  Name;
}

export interface Journal {
  order: number;
  text:  Name;
}

export interface Trade {
  currencies: Currency[];
  items:      Currency[];
}

export interface Currency {
  amount: number;
  id:     number;
}
