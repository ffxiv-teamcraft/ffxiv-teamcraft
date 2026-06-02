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
  tw?:          string;
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
  action?:  number;
  banner?:  string;
  icon:     Icon;
  id:       number;
  name:     Name;
  rewards?: Reward[];
  trades?:  Trade[];
}

export enum Icon {
  APIAssetPathUIIcon062000062301TexFormatPNG = "/api/asset?path=ui/icon/062000/062301.tex&format=png",
  APIAssetPathUIIcon062000062302TexFormatPNG = "/api/asset?path=ui/icon/062000/062302.tex&format=png",
  APIAssetPathUIIcon062000062303TexFormatPNG = "/api/asset?path=ui/icon/062000/062303.tex&format=png",
  APIAssetPathUIIcon062000062304TexFormatPNG = "/api/asset?path=ui/icon/062000/062304.tex&format=png",
  APIAssetPathUIIcon062000062305TexFormatPNG = "/api/asset?path=ui/icon/062000/062305.tex&format=png",
  APIAssetPathUIIcon062000062306TexFormatPNG = "/api/asset?path=ui/icon/062000/062306.tex&format=png",
  APIAssetPathUIIcon062000062307TexFormatPNG = "/api/asset?path=ui/icon/062000/062307.tex&format=png",
  APIAssetPathUIIcon062000062308TexFormatPNG = "/api/asset?path=ui/icon/062000/062308.tex&format=png",
  APIAssetPathUIIcon062000062309TexFormatPNG = "/api/asset?path=ui/icon/062000/062309.tex&format=png",
  APIAssetPathUIIcon062000062310TexFormatPNG = "/api/asset?path=ui/icon/062000/062310.tex&format=png",
  APIAssetPathUIIcon062000062311TexFormatPNG = "/api/asset?path=ui/icon/062000/062311.tex&format=png",
  APIAssetPathUIIcon062000062312TexFormatPNG = "/api/asset?path=ui/icon/062000/062312.tex&format=png",
  APIAssetPathUIIcon062000062313TexFormatPNG = "/api/asset?path=ui/icon/062000/062313.tex&format=png",
  APIAssetPathUIIcon062000062314TexFormatPNG = "/api/asset?path=ui/icon/062000/062314.tex&format=png",
  APIAssetPathUIIcon062000062315TexFormatPNG = "/api/asset?path=ui/icon/062000/062315.tex&format=png",
  APIAssetPathUIIcon062000062316TexFormatPNG = "/api/asset?path=ui/icon/062000/062316.tex&format=png",
  APIAssetPathUIIcon062000062317TexFormatPNG = "/api/asset?path=ui/icon/062000/062317.tex&format=png",
  APIAssetPathUIIcon062000062318TexFormatPNG = "/api/asset?path=ui/icon/062000/062318.tex&format=png",
  APIAssetPathUIIcon062000062319TexFormatPNG = "/api/asset?path=ui/icon/062000/062319.tex&format=png",
  APIAssetPathUIIcon062000062320TexFormatPNG = "/api/asset?path=ui/icon/062000/062320.tex&format=png",
  APIAssetPathUIIcon062000062401TexFormatPNG = "/api/asset?path=ui/icon/062000/062401.tex&format=png",
  APIAssetPathUIIcon062000062402TexFormatPNG = "/api/asset?path=ui/icon/062000/062402.tex&format=png",
  APIAssetPathUIIcon062000062403TexFormatPNG = "/api/asset?path=ui/icon/062000/062403.tex&format=png",
  APIAssetPathUIIcon062000062404TexFormatPNG = "/api/asset?path=ui/icon/062000/062404.tex&format=png",
  APIAssetPathUIIcon062000062405TexFormatPNG = "/api/asset?path=ui/icon/062000/062405.tex&format=png",
  APIAssetPathUIIcon062000062406TexFormatPNG = "/api/asset?path=ui/icon/062000/062406.tex&format=png",
  APIAssetPathUIIcon062000062407TexFormatPNG = "/api/asset?path=ui/icon/062000/062407.tex&format=png",
  APIAssetPathUIIcon062000062408TexFormatPNG = "/api/asset?path=ui/icon/062000/062408.tex&format=png",
  APIAssetPathUIIcon062000062409TexFormatPNG = "/api/asset?path=ui/icon/062000/062409.tex&format=png",
  APIAssetPathUIIcon062000062410TexFormatPNG = "/api/asset?path=ui/icon/062000/062410.tex&format=png",
  APIAssetPathUIIcon062000062411TexFormatPNG = "/api/asset?path=ui/icon/062000/062411.tex&format=png",
  APIAssetPathUIIcon062000062412TexFormatPNG = "/api/asset?path=ui/icon/062000/062412.tex&format=png",
  APIAssetPathUIIcon062000062413TexFormatPNG = "/api/asset?path=ui/icon/062000/062413.tex&format=png",
  APIAssetPathUIIcon062000062414TexFormatPNG = "/api/asset?path=ui/icon/062000/062414.tex&format=png",
  APIAssetPathUIIcon062000062415TexFormatPNG = "/api/asset?path=ui/icon/062000/062415.tex&format=png",
  APIAssetPathUIIcon062000062416TexFormatPNG = "/api/asset?path=ui/icon/062000/062416.tex&format=png",
  APIAssetPathUIIcon062000062417TexFormatPNG = "/api/asset?path=ui/icon/062000/062417.tex&format=png",
  APIAssetPathUIIcon062000062418TexFormatPNG = "/api/asset?path=ui/icon/062000/062418.tex&format=png",
  APIAssetPathUIIcon062000062419TexFormatPNG = "/api/asset?path=ui/icon/062000/062419.tex&format=png",
  APIAssetPathUIIcon062000062420TexFormatPNG = "/api/asset?path=ui/icon/062000/062420.tex&format=png",
  APIAssetPathUIIcon062000062521TexFormatPNG = "/api/asset?path=ui/icon/062000/062521.tex&format=png",
  APIAssetPathUIIcon062000062522TexFormatPNG = "/api/asset?path=ui/icon/062000/062522.tex&format=png",
  APIAssetPathUIIcon062000062951TexFormatPNG = "/api/asset?path=ui/icon/062000/062951.tex&format=png",
  APIAssetPathUIIcon062000062952TexFormatPNG = "/api/asset?path=ui/icon/062000/062952.tex&format=png",
  APIAssetPathUIIcon062000062953TexFormatPNG = "/api/asset?path=ui/icon/062000/062953.tex&format=png",
  APIAssetPathUIIcon071000071201TexFormatPNG = "/api/asset?path=ui/icon/071000/071201.tex&format=png",
  APIAssetPathUIIcon071000071221TexFormatPNG = "/api/asset?path=ui/icon/071000/071221.tex&format=png",
  APIAssetPathUIIcon080000080101TexFormatPNG = "/api/asset?path=ui/icon/080000/080101.tex&format=png",
  APIAssetPathUIIcon080000080102TexFormatPNG = "/api/asset?path=ui/icon/080000/080102.tex&format=png",
  APIAssetPathUIIcon080000080103TexFormatPNG = "/api/asset?path=ui/icon/080000/080103.tex&format=png",
  APIAssetPathUIIcon080000080104TexFormatPNG = "/api/asset?path=ui/icon/080000/080104.tex&format=png",
  APIAssetPathUIIcon080000080105TexFormatPNG = "/api/asset?path=ui/icon/080000/080105.tex&format=png",
  APIAssetPathUIIcon080000080106TexFormatPNG = "/api/asset?path=ui/icon/080000/080106.tex&format=png",
  APIAssetPathUIIcon080000080107TexFormatPNG = "/api/asset?path=ui/icon/080000/080107.tex&format=png",
  APIAssetPathUIIcon080000080108TexFormatPNG = "/api/asset?path=ui/icon/080000/080108.tex&format=png",
  APIAssetPathUIIcon080000080109TexFormatPNG = "/api/asset?path=ui/icon/080000/080109.tex&format=png",
  APIAssetPathUIIcon080000080110TexFormatPNG = "/api/asset?path=ui/icon/080000/080110.tex&format=png",
  APIAssetPathUIIcon080000080112TexFormatPNG = "/api/asset?path=ui/icon/080000/080112.tex&format=png",
  APIAssetPathUIIcon080000080113TexFormatPNG = "/api/asset?path=ui/icon/080000/080113.tex&format=png",
  APIAssetPathUIIcon080000080115TexFormatPNG = "/api/asset?path=ui/icon/080000/080115.tex&format=png",
  APIAssetPathUIIcon080000080116TexFormatPNG = "/api/asset?path=ui/icon/080000/080116.tex&format=png",
  APIAssetPathUIIcon080000080117TexFormatPNG = "/api/asset?path=ui/icon/080000/080117.tex&format=png",
  APIAssetPathUIIcon080000080118TexFormatPNG = "/api/asset?path=ui/icon/080000/080118.tex&format=png",
  APIAssetPathUIIcon080000080119TexFormatPNG = "/api/asset?path=ui/icon/080000/080119.tex&format=png",
  APIAssetPathUIIcon080000080120TexFormatPNG = "/api/asset?path=ui/icon/080000/080120.tex&format=png",
  APIAssetPathUIIcon080000080121TexFormatPNG = "/api/asset?path=ui/icon/080000/080121.tex&format=png",
  APIAssetPathUIIcon080000080122TexFormatPNG = "/api/asset?path=ui/icon/080000/080122.tex&format=png",
  APIAssetPathUIIcon080000080123TexFormatPNG = "/api/asset?path=ui/icon/080000/080123.tex&format=png",
  APIAssetPathUIIcon080000080124TexFormatPNG = "/api/asset?path=ui/icon/080000/080124.tex&format=png",
  APIAssetPathUIIcon080000080125TexFormatPNG = "/api/asset?path=ui/icon/080000/080125.tex&format=png",
  APIAssetPathUIIcon080000080126TexFormatPNG = "/api/asset?path=ui/icon/080000/080126.tex&format=png",
}

export interface Name {
  de: string;
  en: string;
  fr: string;
  ja: string;
}

export interface Reward {
  amount: number;
  hq?:    boolean;
  id:     number;
}

export interface Trade {
  currencies: Currency[];
  items:      Currency[];
}

export interface Currency {
  amount: number;
  id:     number;
}

export interface Title {
  de:  string;
  en:  string;
  fr:  string;
  ja:  Ja;
  ko?: string;
  tw?: string;
  zh?: string;
}

export enum Ja {
  Achievement = "ACHIEVEMENT",
  Alert = "ALERT",
  AlpacaPorter = "ALPACA PORTER",
  AmaroPorter = "AMARO PORTER",
  Analyst = "ANALYST",
  ArtifactSearch = "ARTIFACT SEARCH",
  Blunderville = "BLUNDERVILLE",
  Cactpot = "CACTPOT",
  CeremonyShop = "CEREMONY SHOP",
  Chocobo = "CHOCOBO",
  ChocoboRacing = "CHOCOBO RACING",
  CosmicExploration = "COSMIC EXPLORATION",
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
