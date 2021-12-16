export interface LazyNpc {
  en: string;
  ja: string;
  de: string;
  fr: string;
  title: Title;
  defaultTalks: number[];
  position?: Position;
  festival?: number;
}

export interface Position {
  zoneid: number;
  map: number;
  x: number;
  y: number;
  z: number | null;
}

export interface Title {
  en: string;
  ja: Ja;
  de: string;
  fr: string;
}

export enum Ja {
  Achievement = 'ACHIEVEMENT',
  AmaroPorter = 'AMARO PORTER',
  Cactpot = 'CACTPOT',
  CeremonyShop = 'CEREMONY SHOP',
  Chocobo = 'CHOCOBO',
  ChocoboRacing = 'CHOCOBO RACING',
  DeepDungeon = 'DEEP DUNGEON',
  DeliveryQuests = 'DELIVERY QUESTS',
  Dps = 'DPS',
  Dungeon = 'DUNGEON',
  Empty = '',
  EternalBond = 'ETERNAL BOND',
  Eureka = 'EUREKA',
  FATETrade = 'F.A.T.E. TRADE',
  FalconPorter = 'FALCON PORTER',
  FreeCompany = 'FREE COMPANY',
  Frontline = 'FRONTLINE',
  GATE = 'G.A.T.E.',
  Gatekeeper = 'GATEKEEPER',
  GleanersLeves = 'GLEANERS LEVES',
  GoldSaucer = 'GOLD SAUCER',
  GrandCompany = 'GRAND COMPANY',
  GuildOrder = 'GUILD ORDER',
  Guildleves = 'GUILDLEVES',
  Guildmaster = 'GUILDMASTER',
  Healer = 'HEALER',
  Housing = 'HOUSING',
  Inn = 'INN',
  IshgardianLeves = 'ISHGARDIAN LEVES',
  KUPOOfFORTUNE = 'KUPO of FORTUNE',
  LORDOfVERMINION = 'LORD of VERMINION',
  Linkshell = 'LINKSHELL',
  LockPicker = 'LOCK PICKER',
  LostShard = 'LOST SHARD',
  Materia = 'MATERIA',
  Meanleves = 'MEANLEVES',
  Meister = 'MEISTER',
  OceanFishing = 'OCEAN FISHING',
  RankUp = 'RANK UP',
  Repairs = 'REPAIRS',
  Retainer = 'RETAINER',
  SaveTheQueen = 'SAVE THE QUEEN',
  Seasonal = 'SEASONAL',
  SeasonalEvent = 'SEASONAL EVENT',
  SeasonalShop = 'SEASONAL SHOP',
  Shop = 'SHOP',
  ShopLevelup = 'SHOP & LEVELUP',
  ShopRepairs = 'SHOP & REPAIRS',
  ShopTrade = 'SHOP & TRADE',
  Suite = 'SUITE',
  Tank = 'TANK',
  TheFeast = 'THE FEAST',
  TheMaskedCarnivale = 'THE MASKED CARNIVALE',
  TotalTrade = 'TOTAL TRADE',
  Trade = 'TRADE',
  Transportation = 'TRANSPORTATION',
  TripleTriad = 'TRIPLE TRIAD',
  Weather = 'WEATHER',
}
