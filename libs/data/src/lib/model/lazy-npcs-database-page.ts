export interface LazyNpcsDatabasePage {
  de:           string;
  defaultTalks: Array<string[]>;
  en:           string;
  festival?:    number;
  fr:           string;
  id:           string;
  ja:           string;
  ko?:          string;
  levemetes?:   number[];
  patch:        number;
  position?:    Position;
  quests:       Quest[];
  title:        Title;
  zh?:          string;
}

export interface Position {
  map:    number;
  x:      number;
  y:      number;
  z:      number | null;
  zoneid: number;
}

export interface Quest {
  action?: number;
  icon:    Icon;
  id:      number;
  name:    Name;
}

export enum Icon {
  I071000071221PNG = "/i/071000/071221.png",
}

export interface Name {
  de: string;
  en: string;
  fr: string;
  ja: string;
}

export interface Title {
  de:  string;
  en:  string;
  fr:  string;
  ja:  Ja;
  ko?: string;
  zh?: string;
}

export enum Ja {
  Achievement = "ACHIEVEMENT",
  Alert = "ALERT",
  AlpacaPorter = "ALPACA PORTER",
  AmaroPorter = "AMARO PORTER",
  Analyst = "ANALYST",
  Blunderville = "BLUNDERVILLE",
  Cactpot = "CACTPOT",
  CeremonyShop = "CEREMONY SHOP",
  Chocobo = "CHOCOBO",
  ChocoboRacing = "CHOCOBO RACING",
  CosmicFortune = "COSMIC FORTUNE",
  CosmoExplorer = "COSMO EXPLORER",
  Crops = "CROPS",
  CrystallineConflict = "CRYSTALLINE CONFLICT",
  DeepDungeon = "DEEP DUNGEON",
  DeliveryQuests = "DELIVERY QUESTS",
  Dps = "DPS",
  Empty = "",
  EternalBond = "ETERNAL BOND",
  Eureka = "EUREKA",
  Explore = "EXPLORE",
  FATETrade = "F.A.T.E. TRADE",
  FalconPorter = "FALCON PORTER",
  Feeder = "FEEDER",
  FreeCompany = "FREE COMPANY",
  Frontline = "FRONTLINE",
  GATE = "G.A.T.E.",
  Gatekeeper = "GATEKEEPER",
  GearTrade = "GEAR TRADE",
  GleanersLeves = "GLEANERS LEVES",
  GoldSaucer = "GOLD SAUCER",
  Granary = "GRANARY",
  GrandCompany = "GRAND COMPANY",
  Guide = "GUIDE",
  GuildOrder = "GUILD ORDER",
  Guildleves = "GUILDLEVES",
  Guildmaster = "GUILDMASTER",
  Healer = "HEALER",
  Housing = "HOUSING",
  HuntTrade = "HUNT TRADE",
  Inn = "INN",
  IshgardianLeves = "ISHGARDIAN LEVES",
  Island = "ISLAND",
  KUPOOfFORTUNE = "KUPO of FORTUNE",
  LORDOfVERMINION = "LORD of VERMINION",
  Land = "LAND",
  Linkshell = "LINKSHELL",
  LockPicker = "LOCK PICKER",
  LostShard = "LOST SHARD",
  Materia = "MATERIA",
  MateriaTrade = "MATERIA TRADE",
  Meanleves = "MEANLEVES",
  MechOps = "MECH OPS",
  Meister = "MEISTER",
  OccultCrescent = "OCCULT CRESCENT",
  OceanFishing = "OCEAN FISHING",
  Purchase = "PURCHASE",
  RAIDTrade = "RAID TRADE",
  RankUp = "RANK UP",
  Repairs = "REPAIRS",
  Researcher = "RESEARCHER",
  Retainer = "RETAINER",
  RivalWings = "RIVAL WINGS",
  SaveTheQueen = "SAVE THE QUEEN",
  Seasonal = "SEASONAL",
  SeasonalEvent = "SEASONAL EVENT",
  SeasonalShop = "SEASONAL SHOP",
  Shop = "SHOP",
  ShopLevelup = "SHOP & LEVELUP",
  ShopRepairs = "SHOP & REPAIRS",
  ShopTrade = "SHOP & TRADE",
  SpaceVoyage = "SPACE VOYAGE",
  Suite = "SUITE",
  Tank = "TANK",
  TheMaskedCarnivale = "THE MASKED CARNIVALE",
  TokenTrade = "TOKEN TRADE",
  TomestoneTrade = "TOMESTONE TRADE",
  TotalTrade = "TOTAL TRADE",
  Trade = "TRADE",
  Training = "TRAINING",
  Transportation = "TRANSPORTATION",
  TripleTriad = "TRIPLE TRIAD",
  Turalileves = "TURALILEVES",
  VariantDungeon = "VARIANT DUNGEON",
  Weather = "WEATHER",
  Workshop = "WORKSHOP",
}
