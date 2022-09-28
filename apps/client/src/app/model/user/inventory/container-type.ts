// Source: https://github.com/SapphireServer/Sapphire/blob/c5d63e2eccf483c0e785d373ab9ea9a504c734f4/src/common/Common.h#L188-L271
export enum ContainerType {
  IslandSanctuaryBag = -10,

  Bag0 = 0,
  Bag1 = 1,
  Bag2 = 2,
  Bag3 = 3,

  GearSet0 = 1000,
  GearSet1 = 1001,

  Currency = 2000,
  Crystal = 2001,
  Mail = 2003,
  KeyItem = 2004,
  HandIn = 2005,
  DamagedGear = 2007,
  UNKNOWN_1 = 2008,
  TradeInventory = 2009,

  ArmoryOff = 3200,
  ArmoryHead = 3201,
  ArmoryBody = 3202,
  ArmoryHand = 3203,
  ArmoryWaist = 3204,
  ArmoryLegs = 3205,
  ArmoryFeet = 3206,
  ArmoryNeck = 3207,
  ArmoryEar = 3208,
  ArmoryWrist = 3209,
  ArmoryRing = 3300,

  ArmorySoulCrystal = 3400,
  ArmoryMain = 3500,

  SaddleBag0 = 4000,
  SaddleBag1 = 4001,
  PremiumSaddleBag0 = 4100,
  PremiumSaddleBag1 = 4101,

  RetainerBag0 = 10000,
  RetainerBag1 = 10001,
  RetainerBag2 = 10002,
  RetainerBag3 = 10003,
  RetainerBag4 = 10004,
  RetainerBag5 = 10005,
  RetainerBag6 = 10006,
  RetainerEquippedGear = 11000,
  RetainerGil = 12000,
  RetainerCrystal = 12001,
  RetainerMarket = 12002,

  FreeCompanyBag0 = 20000,
  FreeCompanyBag1 = 20001,
  FreeCompanyBag2 = 20002,
  FreeCompanyBag3 = 20003,
  FreeCompanyBag4 = 20004,
  FreeCompanyBag5 = 20005,
  FreeCompanyBag6 = 20006,
  FreeCompanyBag7 = 20007,
  FreeCompanyBag8 = 20008,
  FreeCompanyBag9 = 20009,
  FreeCompanyBag10 = 20010,
  FreeCompanyGil = 22000,
  FreeCompanyCrystal = 22001,

  // housing interior containers
  HousingInteriorAppearance = 25002,

  // 50 in each container max, 400 slots max
  HousingInteriorPlacedItems1 = 25003,
  HousingInteriorPlacedItems2 = 25004,
  HousingInteriorPlacedItems3 = 25005,
  HousingInteriorPlacedItems4 = 25006,
  HousingInteriorPlacedItems5 = 25007,
  HousingInteriorPlacedItems6 = 25008,
  HousingInteriorPlacedItems7 = 25009,
  HousingInteriorPlacedItems8 = 25010,

  // 50 max per container, 400 slots max
  // slot limit increased 'temporarily' for relocation for all estates
  // see: https://na.finalfantasyxiv.com/lodestone/topics/detail/d781e0d538428aef93b8bed4b50dd62c3c50fc74
  HousingInteriorStoreroom1 = 27001,
  HousingInteriorStoreroom2 = 27002,
  HousingInteriorStoreroom3 = 27003,
  HousingInteriorStoreroom4 = 27004,
  HousingInteriorStoreroom5 = 27005,
  HousingInteriorStoreroom6 = 27006,
  HousingInteriorStoreroom7 = 27007,
  HousingInteriorStoreroom8 = 27008,


  // housing exterior containers
  HousingExteriorAppearance = 25000,
  HousingExteriorPlacedItems = 25001,
  HousingExteriorStoreroom = 27000,
}
