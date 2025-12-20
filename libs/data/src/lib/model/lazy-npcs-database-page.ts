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
  action?:  number;
  banner?:  string;
  icon:     Icon;
  id:       number;
  name:     Name;
  rewards?: Reward[];
  trades?:  Trade[];
}

export enum Icon {
  I062000062301PNG = "/i/062000/062301.png",
  I062000062302PNG = "/i/062000/062302.png",
  I062000062303PNG = "/i/062000/062303.png",
  I062000062304PNG = "/i/062000/062304.png",
  I062000062305PNG = "/i/062000/062305.png",
  I062000062306PNG = "/i/062000/062306.png",
  I062000062307PNG = "/i/062000/062307.png",
  I062000062308PNG = "/i/062000/062308.png",
  I062000062309PNG = "/i/062000/062309.png",
  I062000062310PNG = "/i/062000/062310.png",
  I062000062311PNG = "/i/062000/062311.png",
  I062000062312PNG = "/i/062000/062312.png",
  I062000062313PNG = "/i/062000/062313.png",
  I062000062314PNG = "/i/062000/062314.png",
  I062000062315PNG = "/i/062000/062315.png",
  I062000062316PNG = "/i/062000/062316.png",
  I062000062317PNG = "/i/062000/062317.png",
  I062000062318PNG = "/i/062000/062318.png",
  I062000062319PNG = "/i/062000/062319.png",
  I062000062320PNG = "/i/062000/062320.png",
  I062000062401PNG = "/i/062000/062401.png",
  I062000062402PNG = "/i/062000/062402.png",
  I062000062403PNG = "/i/062000/062403.png",
  I062000062404PNG = "/i/062000/062404.png",
  I062000062405PNG = "/i/062000/062405.png",
  I062000062406PNG = "/i/062000/062406.png",
  I062000062407PNG = "/i/062000/062407.png",
  I062000062408PNG = "/i/062000/062408.png",
  I062000062409PNG = "/i/062000/062409.png",
  I062000062410PNG = "/i/062000/062410.png",
  I062000062411PNG = "/i/062000/062411.png",
  I062000062412PNG = "/i/062000/062412.png",
  I062000062413PNG = "/i/062000/062413.png",
  I062000062414PNG = "/i/062000/062414.png",
  I062000062415PNG = "/i/062000/062415.png",
  I062000062416PNG = "/i/062000/062416.png",
  I062000062417PNG = "/i/062000/062417.png",
  I062000062418PNG = "/i/062000/062418.png",
  I062000062419PNG = "/i/062000/062419.png",
  I062000062420PNG = "/i/062000/062420.png",
  I062000062521PNG = "/i/062000/062521.png",
  I062000062522PNG = "/i/062000/062522.png",
  I062000062951PNG = "/i/062000/062951.png",
  I062000062952PNG = "/i/062000/062952.png",
  I062000062953PNG = "/i/062000/062953.png",
  I071000071201PNG = "/i/071000/071201.png",
  I071000071221PNG = "/i/071000/071221.png",
  I080000080101PNG = "/i/080000/080101.png",
  I080000080102PNG = "/i/080000/080102.png",
  I080000080103PNG = "/i/080000/080103.png",
  I080000080104PNG = "/i/080000/080104.png",
  I080000080105PNG = "/i/080000/080105.png",
  I080000080106PNG = "/i/080000/080106.png",
  I080000080107PNG = "/i/080000/080107.png",
  I080000080108PNG = "/i/080000/080108.png",
  I080000080109PNG = "/i/080000/080109.png",
  I080000080110PNG = "/i/080000/080110.png",
  I080000080112PNG = "/i/080000/080112.png",
  I080000080113PNG = "/i/080000/080113.png",
  I080000080115PNG = "/i/080000/080115.png",
  I080000080116PNG = "/i/080000/080116.png",
  I080000080117PNG = "/i/080000/080117.png",
  I080000080118PNG = "/i/080000/080118.png",
  I080000080119PNG = "/i/080000/080119.png",
  I080000080120PNG = "/i/080000/080120.png",
  I080000080121PNG = "/i/080000/080121.png",
  I080000080122PNG = "/i/080000/080122.png",
  I080000080123PNG = "/i/080000/080123.png",
  I080000080124PNG = "/i/080000/080124.png",
  I080000080125PNG = "/i/080000/080125.png",
  I080000080126PNG = "/i/080000/080126.png",
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
