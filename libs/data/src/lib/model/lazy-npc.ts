export interface LazyNpc {
  de:           string;
  defaultTalks: number[];
  en:           string;
  festival?:    number;
  fr:           string;
  ja:           string;
  position?:    Position;
  title:        Title;
}

export interface Position {
  map:    number;
  x:      number;
  y:      number;
  z:      number | null;
  zoneid: number;
}

export interface Title {
  de: string;
  en: string;
  fr: string;
  ja: Ja;
}

export enum Ja {
  Achievement = "ACHIEVEMENT",
  AmaroPorter = "AMARO PORTER",
  Cactpot = "CACTPOT",
  CeremonyShop = "CEREMONY SHOP",
  Chocobo = "CHOCOBO",
  ChocoboRacing = "CHOCOBO RACING",
  Crops = "CROPS",
  CrystallineConflict = "CRYSTALLINE CONFLICT",
  DeepDungeon = "DEEP DUNGEON",
  DeliveryQuests = "DELIVERY QUESTS",
  Dps = "DPS",
  Empty = "",
  EternalBond = "ETERNAL BOND",
  Eureka = "EUREKA",
  FATETrade = "F.A.T.E. TRADE",
  FalconPorter = "FALCON PORTER",
  Feeder = "FEEDER",
  FreeCompany = "FREE COMPANY",
  Frontline = "FRONTLINE",
  GATE = "G.A.T.E.",
  Gatekeeper = "GATEKEEPER",
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
  Meanleves = "MEANLEVES",
  Meister = "MEISTER",
  OceanFishing = "OCEAN FISHING",
  Purchase = "PURCHASE",
  RankUp = "RANK UP",
  Repairs = "REPAIRS",
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
  Suite = "SUITE",
  Tank = "TANK",
  TheMaskedCarnivale = "THE MASKED CARNIVALE",
  TotalTrade = "TOTAL TRADE",
  Trade = "TRADE",
  Transportation = "TRANSPORTATION",
  TripleTriad = "TRIPLE TRIAD",
  VariantDungeon = "VARIANT DUNGEON",
  Weather = "WEATHER",
  Workshop = "WORKSHOP",
}
