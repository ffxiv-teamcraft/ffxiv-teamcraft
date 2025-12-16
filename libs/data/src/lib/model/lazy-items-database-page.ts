export interface LazyItemsDatabasePage {
  action?:            number;
  actionData?:        number;
  additionalData?:    number;
  bonuses?:           Bonus[];
  bpSpecial:          number[];
  cjUse?:             number;
  cjc?:               number;
  collectable?:       Collectable;
  delay?:             number;
  description:        Description;
  desynths?:          number[];
  dyeCount?:          number;
  elvl?:              number;
  equipSlotCategory?: number;
  equipable?:         boolean;
  gcReward?:          number;
  hasMoreDetails?:    boolean;
  hq?:                boolean;
  icon?:              string;
  id:                 number;
  ilvl?:              number;
  ingameDrawing?:     string;
  ingredientFor?:     IngredientFor[];
  isFish?:            boolean;
  jobs?:              Job[];
  level?:             number;
  loots?:             string[];
  mDef?:              number;
  mDmg?:              number;
  name:               Description;
  nodesUnlock?:       number[];
  overmeld?:          boolean;
  pDef?:              number;
  pDmg?:              number;
  patch?:             number;
  price?:             number;
  recipesUnlock?:     RecipesUnlock[];
  reductions?:        number[];
  repair?:            number;
  searchCategory?:    number;
  sellPrice?:         number;
  sockets?:           number;
  stats?:             Stat[];
  supply?:            Supply;
  trade?:             boolean;
  tradeEntries?:      TradeEntry[];
  unique?:            boolean | number;
  usedForLeves?:      UsedForLeve[];
  usedInQuests?:      number[];
}

export interface Bonus {
  HQ:       number;
  ID:       number;
  Max?:     number;
  MaxHQ?:   number;
  NQ:       number;
  Relative: boolean;
}

export interface Collectable {
  base:         Base;
  collectable?: number;
  group?:       number;
  high:         Base;
  hwd?:         boolean;
  id:           number;
  level:        number;
  levelMax?:    number;
  levelMin?:    number;
  mid:          Base;
  reward:       number;
  rewardType?:  number;
  shopId?:      number;
  type:         CollectableType;
}

export interface Base {
  exp:       number;
  quantity?: number;
  rating:    number;
  scrip:     number;
}

export enum CollectableType {
  CollectablesShopItem = "CollectablesShopItem",
  HWDCrafterSupply = "HWDCrafterSupply",
}

export interface Description {
  de:  string;
  en:  string;
  fr:  string;
  ja:  string;
  ko?: string;
  zh?: string;
}

export interface IngredientFor {
  itemId: number;
  job:    number;
  lvl:    number;
  stars:  number;
}

export enum Job {
  AST = "AST",
  Acn = "ACN",
  Adv = "ADV",
  Alc = "ALC",
  Arc = "ARC",
  Arm = "ARM",
  Blm = "BLM",
  Blu = "BLU",
  Brd = "BRD",
  Bsm = "BSM",
  Btn = "BTN",
  Cnj = "CNJ",
  Crp = "CRP",
  Cul = "CUL",
  Dnc = "DNC",
  Drg = "DRG",
  Drk = "DRK",
  Fsh = "FSH",
  GSM = "GSM",
  Gla = "GLA",
  Gnb = "GNB",
  Lnc = "LNC",
  Ltw = "LTW",
  Mch = "MCH",
  Min = "MIN",
  Mnk = "MNK",
  Mrd = "MRD",
  Nin = "NIN",
  PLD = "PLD",
  Pct = "PCT",
  Pgl = "PGL",
  RDM = "RDM",
  Rog = "ROG",
  Rpr = "RPR",
  Sam = "SAM",
  Sch = "SCH",
  Sge = "SGE",
  Smn = "SMN",
  Thm = "THM",
  Vpr = "VPR",
  War = "WAR",
  Whm = "WHM",
  Wvr = "WVR",
}

export interface RecipesUnlock {
  ingredients: Ingredient[];
  itemId:      number;
  job:         number;
  lvl:         number;
  recipeId:    number;
  stars:       number;
  yields:      number;
}

export interface Ingredient {
  amount:  number;
  id:      number;
  quality: number;
}

export interface Stat {
  HQ?: number;
  ID:  number;
  NQ:  number;
}

export interface Supply {
  amount: number;
  seals:  number;
  xp:     number;
}

export interface TradeEntry {
  gc?:            number;
  id:             number;
  npcs:           number[];
  topicSelectId?: number;
  trades:         Trade[];
  type:           TradeEntryType;
}

export interface Trade {
  currencies:      Currency[];
  items:           Currency[];
  requiredGCRank?: number;
}

export interface Currency {
  amount: number;
  hq?:    boolean;
  id:     number;
}

export enum TradeEntryType {
  AnimaWeapon5TradeItem = "AnimaWeapon5TradeItem",
  GCShop = "GCShop",
  GilShop = "GilShop",
  SpecialShop = "SpecialShop",
}

export interface UsedForLeve {
  amount:   number;
  classJob: number;
  leve:     number;
  lvl:      number;
}
