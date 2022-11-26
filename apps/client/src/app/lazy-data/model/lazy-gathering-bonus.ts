export interface LazyGatheringBonus {
  value:          number;
  conditionValue: number;
  bonus?:         Bonus;
  condition?:     Bonus;
}

export interface Bonus {
  en: En;
  de: De;
  ja: Ja;
  fr: string;
}

export enum De {
  BeiMaximalemSammlerwertErhabenheitsrateValue = "Bei maximalem Sammlerwert: Erhabenheitsrate +{{value}} %",
  ChanceAufStückzahlBonusValue = "Chance auf Stückzahl-Bonus +{{value}} %",
  DeBeiMaximalemSammlerwertErhabenheitsrateValue = "Bei maximalem Sammlerwert: Erhabenheitsrate +{{value}} % (↑)",
  DeChanceAufStückzahlBonusValue = "Chance auf Stückzahl-Bonus +{{value}} % (↑)",
  DeSammelversucheBelastbarkeitValue = "Sammelversuche/Belastbarkeit +{{value}} (↑)",
  ExpertiseMinValue = "Expertise min. {{value}}",
  GESKMinValue = "GESK min. {{value}}",
  HochstufigeValue = "Hochstufige +{{value}} %",
  MaxSPValue = "Max. SP ≥ {{value}}",
  MinValueErSträhne = "Min. {{value}}er-Strähne",
  SammelnMaxValue = "Sammeln max. {{value}}",
  SammelnMinValue = "Sammeln min. {{value}}",
  SammelrateValue = "Sammelrate +{{value}} %",
  SammelversucheBelastbarkeitValue = "Sammelversuche/Belastbarkeit +{{value}}",
  Sammlerstück = "Sammlerstück",
  StückzahlValue = "Stückzahl +{{value}}",
  StückzahlValueSteigend = "Stückzahl +{{value}} (steigend)",
  UNHANDLED0X2BAusgerüstet = "[UNHANDLED 0x2B] ausgerüstet",
  UnterEigenerStufeValue = "Unter eigener Stufe +{{value}} %",
  Verfügbar = "Verfügbar",
}

export enum En {
  Available = " Available",
  ChainValue = "Chain ≥ #{{value}}",
  CollectableAvailable = " Collectable Available",
  DEXValue = "DEX ≥ {{value}}",
  EnGathererSBoonChanceValue = " Gatherer's Boon Chance +{{value}}%～",
  EnGatheringAttemptsIntegrityValue = " Gathering Attempts/Integrity +{{value}}～",
  EnGatheringValue = "Gathering < {{value}}",
  EnGatheringYieldValue = " Gathering Yield +{{value}}～",
  EnSublimeRateValueRequiresMaximumCollectability = "Sublime Rate +{{value}}%～ (Requires Maximum Collectability)",
  GathererSBoonChanceValue = " Gatherer's Boon Chance +{{value}}%",
  GatheringAttemptsIntegrityValue = " Gathering Attempts/Integrity +{{value}}",
  GatheringRateValue = " Gathering Rate +{{value}}%",
  GatheringValue = "Gathering ≥ {{value}}",
  GatheringYieldValue = " Gathering Yield +{{value}}",
  HighLevelItemGatheringRateValue = " High-level Item Gathering Rate +{{value}}%",
  LowLevelItemGatheringRateValue = " Low-level Item Gathering Rate +{{value}}%",
  MaxGPValue = "Max GP ≥ {{value}}",
  PerceptionValue = "Perception ≥ {{value}}",
  SublimeRateValueRequiresMaximumCollectability = "Sublime Rate +{{value}}% (Requires Maximum Collectability)",
  UNHANDLED0X28Equipped = "[UNHANDLED 0x28] Equipped",
}

export enum Ja {
  DEXValue以上 = "DEX {{value}}以上",
  GPmaxValue以上 = "GPmax {{value}}以上",
  UNHANDLED0X28装備時 = "[UNHANDLED 0x28]装備時",
  チェイン数Value以上 = "チェイン数 {{value}}以上",
  収集価値MAX時昇華率Value = "収集価値MAX時：昇華率＋{{value}}%",
  収集価値MAX時昇華率Value上昇タイプ = "収集価値MAX時：昇華率＋{{value}}%（上昇タイプ）",
  収集品採集可能 = "収集品採集可能",
  技術力Value以上 = "技術力 {{value}}以上",
  採集回数耐久Value = "採集回数／耐久＋{{value}}",
  採集回数耐久Value上昇タイプ = "採集回数／耐久＋{{value}}（上昇タイプ）",
  格上レベルアイテム獲得率Value = "格上レベルアイテム獲得率＋{{value}}％",
  獲得力Value以上 = "獲得力 {{value}}以上",
  獲得力Value未満 = "獲得力 {{value}}未満",
  獲得可能 = "獲得可能",
  獲得数Value個 = "獲得数＋{{value}}個",
  獲得数Value個上昇タイプ = "獲得数＋{{value}}個（上昇タイプ）",
  獲得数ボーナス発生率Value = "獲得数ボーナス発生率＋{{value}}%",
  獲得数ボーナス発生率Value上昇タイプ = "獲得数ボーナス発生率＋{{value}}%（上昇タイプ）",
  獲得率Value = "獲得率＋{{value}}％",
  自レベル以下のアイテム獲得率Value = "自レベル以下のアイテム獲得率＋{{value}}％",
}
