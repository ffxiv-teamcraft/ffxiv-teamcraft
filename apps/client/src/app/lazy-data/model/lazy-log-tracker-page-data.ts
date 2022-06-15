export interface LazyLogTrackerPageData {
  id:                     number;
  masterbook?:            Masterbook | null;
  startLevel:             number | { [key: string]: number };
  recipes?:               Recipe[];
  divisionId:             number;
  requiredForAchievement: boolean;
  items?:                 Item[];
}

export interface Item {
  itemId: number;
  ilvl:   number;
  lvl:    number;
  stars:  number;
  hidden: number;
  nodes:  Node[];
}

export interface Node {
  gatheringNode: GatheringNode;
  alarms:        Alarm[];
}

export interface Alarm {
  itemId:       number;
  nodeId:       number;
  duration:     number;
  mapId:        number;
  zoneId:       number;
  areaId:       number;
  type:         number;
  coords:       Coords;
  spawns:       number[];
  reduction:    boolean;
  ephemeral:    boolean;
  nodeContent:  number[];
  weathers:     any[];
  weathersFrom: any[];
  snagging:     boolean;
  predators:    any[];
  note:         string;
  enabled:      boolean;
  folklore?:    number;
}

export interface Coords {
  x: number;
  y: number;
  z: number;
}

export interface GatheringNode {
  items:                 number[];
  limited:               boolean;
  level:                 number;
  type:                  number;
  legendary:             boolean;
  ephemeral:             boolean;
  spawns:                number[];
  duration:              number;
  x:                     number;
  y:                     number;
  z:                     number;
  map:                   number;
  id:                    number;
  zoneId:                number;
  matchingItemId:        number;
  hiddenItems?:          number[];
  matchingItemIsHidden?: boolean;
  folklore?:             number;
}

export interface Masterbook {
  ID:           number;
  Item:         ItemClass;
  ItemTarget:   ItemTarget;
  ItemTargetID: number;
  Name:         string;
  Name_de:      string;
  Name_en:      string;
  Name_fr:      string;
  Name_ja:      string;
}

export interface ItemClass {
  AdditionalData:             number;
  Adjective:                  number;
  AetherialReduce:            number;
  AlwaysCollectable:          number;
  Article:                    number;
  BaseParam0:                 number;
  BaseParam1:                 number;
  BaseParam2:                 number;
  BaseParam3:                 number;
  BaseParam4:                 number;
  BaseParam5:                 number;
  BaseParamModifier:          number;
  BaseParamSpecial0:          number;
  BaseParamSpecial1:          number;
  BaseParamSpecial2:          number;
  BaseParamSpecial3:          number;
  BaseParamSpecial4:          number;
  BaseParamSpecial5:          number;
  BaseParamValue0:            number;
  BaseParamValue1:            number;
  BaseParamValue2:            number;
  BaseParamValue3:            number;
  BaseParamValue4:            number;
  BaseParamValue5:            number;
  BaseParamValueSpecial0:     number;
  BaseParamValueSpecial1:     number;
  BaseParamValueSpecial2:     number;
  BaseParamValueSpecial3:     number;
  BaseParamValueSpecial4:     number;
  BaseParamValueSpecial5:     number;
  Block:                      number;
  BlockRate:                  number;
  CanBeHq:                    number;
  CastTimeS:                  number;
  ClassJobCategory:           number;
  ClassJobRepair:             number;
  ClassJobUse:                number;
  CooldownS:                  number;
  DamageMag:                  number;
  DamagePhys:                 number;
  DefenseMag:                 number;
  DefensePhys:                number;
  DelayMs:                    number;
  Description:                string;
  Description_de:             string;
  Description_en:             string;
  Description_fr:             string;
  Description_ja:             string;
  Desynth:                    number;
  EquipRestriction:           number;
  EquipSlotCategory:          number;
  FilterGroup:                number;
  GrandCompany:               number;
  ID:                         number;
  Icon:                       Icon;
  IconHD:                     IconHD;
  IconID:                     number;
  IsAdvancedMeldingPermitted: number;
  IsCollectable:              number;
  IsCrestWorthy:              number;
  IsDyeable:                  number;
  IsGlamourous:               number;
  IsIndisposable:             number;
  IsPvP:                      number;
  IsUnique:                   number;
  IsUntradable:               number;
  ItemAction:                 number;
  ItemGlamour:                number;
  ItemRepair:                 number;
  ItemSearchCategory:         number;
  ItemSeries:                 number;
  ItemSortCategory:           number;
  ItemSpecialBonus:           number;
  ItemSpecialBonusParam:      number;
  ItemUICategory:             number;
  LevelEquip:                 number;
  LevelItem:                  number;
  Lot:                        number;
  MateriaSlotCount:           number;
  MaterializeType:            number;
  ModelMain:                  Model;
  ModelSub:                   Model;
  Name:                       string;
  Name_de:                    string;
  Name_en:                    string;
  Name_fr:                    string;
  Name_ja:                    string;
  Plural:                     string;
  Plural_de:                  string;
  Plural_en:                  string;
  Plural_fr:                  string;
  Plural_ja:                  string;
  PossessivePronoun:          number;
  PriceLow:                   number;
  PriceMid:                   number;
  Pronoun:                    number;
  Rarity:                     number;
  Singular:                   string;
  Singular_de:                string;
  Singular_en:                string;
  Singular_fr:                string;
  Singular_ja:                string;
  StackSize:                  number;
  StartsWithVowel:            number;
  SubStatCategory:            number;
}

export enum Icon {
  I026000026002PNG = "/i/026000/026002.png",
  I026000026155PNG = "/i/026000/026155.png",
  I026000026156PNG = "/i/026000/026156.png",
  I026000026157PNG = "/i/026000/026157.png",
  I026000026158PNG = "/i/026000/026158.png",
  I026000026159PNG = "/i/026000/026159.png",
  I026000026160PNG = "/i/026000/026160.png",
}

export enum IconHD {
  I026000026002_Hr1PNG = "/i/026000/026002_hr1.png",
  I026000026155_Hr1PNG = "/i/026000/026155_hr1.png",
  I026000026156_Hr1PNG = "/i/026000/026156_hr1.png",
  I026000026157_Hr1PNG = "/i/026000/026157_hr1.png",
  I026000026158_Hr1PNG = "/i/026000/026158_hr1.png",
  I026000026159_Hr1PNG = "/i/026000/026159_hr1.png",
  I026000026160_Hr1PNG = "/i/026000/026160_hr1.png",
}

export enum Model {
  The0000 = "0, 0, 0, 0",
}

export enum ItemTarget {
  Item = "Item",
}

export interface Recipe {
  recipeId: number;
  itemId:   number;
  rlvl:     number;
  leves:    number[];
}
