export interface LazyGatheringBonus {
  bonus?:         Bonus;
  condition?:     Bonus;
  conditionValue: number;
  value:          number;
}

export interface Bonus {
  de: De;
  en: En;
  fr: Fr;
  ja: Ja;
}

export enum De {
  BeiMaximalemSammlerwertErhabenheitsrateValue = "Bei maximalem Sammlerwert: Erhabenheitsrate +{{value}} % (↑)",
  ChanceAufStückzahlBonusValue = "Chance auf Stückzahl-Bonus +{{value}} %",
  DeChanceAufStückzahlBonusValue = "Chance auf Stückzahl-Bonus +{{value}} % (↑)",
  DeFachkundigeLeseEffektchanceValue = "Fachkundige Lese: Effektchance +{{value}}",
  DeIntuitionEffektstärkeValue = "Intuition: Effektstärke +{{value}}",
  DePrüfenderBlickEffektstärkeValue = "Prüfender Blick: Effektstärke +{{value}}",
  DeSammelversucheBelastbarkeitValue = "Sammelversuche/Belastbarkeit +{{value}} (↑)",
  DeSammlerwertValue = "Sammlerwert +{{value}}",
  ExpertiseMinValue = "Expertise min. {{value}}",
  FachkundigeLeseEffektchanceValue = "Fachkundige Lese: Effektchance +{{value}} (↑)",
  GESKMinValue = "GESK min. {{value}}",
  HochstufigeValue = "Hochstufige +{{value}} %",
  IntuitionEffektstärkeValue = "Intuition: Effektstärke +{{value}} (↑)",
  MaxSPValue = "Max. SP ≥ {{value}}",
  MinValueErSträhne = "Min. {{value}}er-Strähne",
  PrüfenderBlickEffektstärkeValue = "Prüfender Blick: Effektstärke +{{value}} (↑)",
  SammelnMinValue = "Sammeln min. {{value}}",
  SammelrateValue = "Sammelrate +{{value}} %",
  SammelversucheBelastbarkeitValue = "Sammelversuche/Belastbarkeit +{{value}}",
  Sammlerstück = "Sammlerstück",
  SammlerwertValue = "Sammlerwert +{{value}} (↑)",
  StückzahlValue = "Stückzahl +{{value}}",
  StückzahlValueSteigend = "Stückzahl +{{value}} (steigend)",
  UNHANDLED0X2BAusgerüstet = "[UNHANDLED 0x2B] ausgerüstet",
  UnterEigenerStufeValue = "Unter eigener Stufe +{{value}} %",
  Verfügbar = "Verfügbar",
}

export enum En {
  Available = " Available",
  ChainValue = "Chain ≥ #{{value}}",
  CollectabilityValue = " Collectability +{{value}}～",
  CollectableAvailable = " Collectable Available",
  CollectorSIntuitionEffectivenessValue = " Collector's Intuition Effectiveness +{{value}}%～",
  DEXValue = "DEX ≥ {{value}}",
  EnCollectabilityValue = " Collectability +{{value}}",
  EnCollectorSIntuitionEffectivenessValue = " Collector's Intuition Effectiveness +{{value}}%",
  EnGathererSBoonChanceValue = " Gatherer's Boon Chance +{{value}}%～",
  EnGatheringAttemptsIntegrityValue = " Gathering Attempts/Integrity +{{value}}～",
  EnGatheringYieldValue = " Gathering Yield +{{value}}～",
  EnMeticulousActionEffectChanceValue = " Meticulous Action Effect Chance +{{value}}%",
  EnScrutinyEffectivenessValue = " Scrutiny Effectiveness +{{value}}%",
  GathererSBoonChanceValue = " Gatherer's Boon Chance +{{value}}%",
  GatheringAttemptsIntegrityValue = " Gathering Attempts/Integrity +{{value}}",
  GatheringRateValue = " Gathering Rate +{{value}}%",
  GatheringValue = "Gathering ≥ {{value}}",
  GatheringYieldValue = " Gathering Yield +{{value}}",
  HighLevelItemGatheringRateValue = " High-level Item Gathering Rate +{{value}}%",
  LowLevelItemGatheringRateValue = " Low-level Item Gathering Rate +{{value}}%",
  MaxGPValue = "Max GP ≥ {{value}}",
  MeticulousActionEffectChanceValue = " Meticulous Action Effect Chance +{{value}}%～",
  PerceptionValue = "Perception ≥ {{value}}",
  ScrutinyEffectivenessValue = " Scrutiny Effectiveness +{{value}}%～",
  SublimeRateValueRequiresMaximumCollectability = "Sublime Rate +{{value}}%～ (Requires Maximum Collectability)",
  UNHANDLED0X28Equipped = "[UNHANDLED 0x28] Equipped",
}

export enum Fr {
  BonusDInspectionRigoureuseValue = " Bonus d'Inspection rigoureuse +{{value}}% (↑)",
  BonusDIntuitionValue = " Bonus d'Intuition +{{value}}% (↑)",
  ChancesDeRécolteSuppValue = " Chances de récolte supp. +{{value}}%",
  ChancesDeSélectionMéthodiqueValue = " Chances de Sélection méthodique +{{value}}% (↑)",
  ChaîneValue = "Chaîne ≧ {{value}}",
  CollecteValue = "Collecte ≧ {{value}}",
  Collectionnable = "  Collectionnable",
  DextéritéValue = "Dextérité ≧ {{value}}",
  FrBonusDIntuitionValue = " Bonus d'Intuition +{{value}}%",
  FrChancesDeRécolteSuppValue = " Chances de récolte supp. +{{value}}% (↑)",
  FrChancesDeSélectionMéthodiqueValue = " Chances de Sélection méthodique +{{value}}%",
  FrNombreDeTentativesValue = " Nombre de tentatives + {{value}} (↑)",
  FrQuantitéValue = " Quantité + {{value}} (↑)",
  FrValeurDeCollectionValue = " Valeur de collection + {{value}}",
  NombreDeTentativesValue = " Nombre de tentatives + {{value}}",
  ObjetsDeHautNiveauValue = " Objets de haut niveau +{{value}}%",
  ObjetsDeNiveauÉgalOuInférieurValue = " Objets de niveau égal ou inférieur +{{value}}%",
  PRValue = "PR ≧ {{value}}",
  QuantitéValue = " Quantité + {{value}}",
  Récoltable = " récoltable",
  SavoirFaireValue = "Savoir-faire ≧ {{value}}",
  SublimationValueQuandValCollectionMax = " Sublimation +{{value}}% quand val. collection max. (↑)",
  TauxDeRécolteValue = " Taux de récolte +{{value}}%",
  UNHANDLED0X28UNHANDLED0X28 = "[UNHANDLED 0x28] [UNHANDLED 0x28]",
  ValeurDeCollectionValue = " Valeur de collection + {{value}} (↑)",
}

export enum Ja {
  DEXValue以上 = "DEX {{value}}以上",
  GPmaxValue以上 = "GPmax {{value}}以上",
  UNHANDLED0X28装備時 = "[UNHANDLED 0x28]装備時",
  チェイン数Value以上 = "チェイン数 {{value}}以上",
  バリューアップ効果Value = "バリューアップ効果＋{{value}}%",
  バリューアップ効果Value上昇タイプ = "バリューアップ効果＋{{value}}%（上昇タイプ）",
  収集価値MAX時昇華率Value上昇タイプ = "収集価値MAX時：昇華率＋{{value}}%（上昇タイプ）",
  収集価値Value = "収集価値＋{{value}}",
  収集価値Value上昇タイプ = "収集価値＋{{value}}（上昇タイプ）",
  収集品採集可能 = "収集品採集可能",
  慎重純化追加効果発生率Value = "慎重純化：追加効果発生率＋{{value}}%",
  慎重純化追加効果発生率Value上昇タイプ = "慎重純化：追加効果発生率＋{{value}}%（上昇タイプ）",
  技術力Value以上 = "技術力 {{value}}以上",
  採集回数耐久Value = "採集回数／耐久＋{{value}}",
  採集回数耐久Value上昇タイプ = "採集回数／耐久＋{{value}}（上昇タイプ）",
  格上レベルアイテム獲得率Value = "格上レベルアイテム獲得率＋{{value}}％",
  獲得力Value以上 = "獲得力 {{value}}以上",
  獲得可能 = "獲得可能",
  獲得数Value個 = "獲得数＋{{value}}個",
  獲得数Value個上昇タイプ = "獲得数＋{{value}}個（上昇タイプ）",
  獲得数ボーナス発生率Value = "獲得数ボーナス発生率＋{{value}}%",
  獲得数ボーナス発生率Value上昇タイプ = "獲得数ボーナス発生率＋{{value}}%（上昇タイプ）",
  獲得率Value = "獲得率＋{{value}}％",
  自レベル以下のアイテム獲得率Value = "自レベル以下のアイテム獲得率＋{{value}}％",
  集中検分ブースト率Value = "集中検分：ブースト率＋{{value}}%",
  集中検分ブースト率Value上昇タイプ = "集中検分：ブースト率＋{{value}}%（上昇タイプ）",
}
