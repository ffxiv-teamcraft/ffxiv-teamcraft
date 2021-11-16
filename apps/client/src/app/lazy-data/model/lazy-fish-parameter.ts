export interface LazyFishParameter {
  id:          number;
  itemId:      number;
  level:       number;
  icon:        string;
  mapId:       number;
  zoneId:      number;
  timed:       number;
  weathered:   number;
  stars:       number;
  recordType?: RecordType;
  folklore?:   number;
}

export interface RecordType {
  en: En;
  de: De;
  ja: Ja;
  fr: Fr;
}

export enum De {
  Dünen = "Dünen",
  Flüsse = "Flüsse",
  Hochsee = "Hochsee",
  Magma = "Magma",
  Salzseen = "Salzseen",
  SchwebInseln = "Schweb-Inseln",
  Seen = "Seen",
  Wolken = "Wolken",
  Ätherquellen = "Ätherquellen",
}

export enum En {
  AetherochemicalSpills = "Aetherochemical Spills",
  DeepSea = "Deep Sea",
  FloatingIslands = "Floating Islands",
  Lakes = "Lakes",
  Magma = "Magma",
  Rivers = "Rivers",
  SaltLakes = "Salt Lakes",
  Sands = "Sands",
  Skies = "Skies",
}

export enum Fr {
  FuitesMagismologiques = "Fuites magismologiques",
  LacSalé = "Lac salé",
  LacsEtMarais = "Lacs et marais",
  Lave = "Lave",
  Nuages = "Nuages",
  Oasis = "Oasis",
  PleineMer = "Pleine mer",
  Rivières = "Rivières",
  ÎlesCélestes = "Îles célestes",
}

export enum Ja {
  塩湖 = "塩湖",
  沖合 = "沖合",
  河川 = "河川",
  浮島 = "浮島",
  湖沼 = "湖沼",
  溶岩 = "溶岩",
  砂海 = "砂海",
  雲海 = "雲海",
  魔泉 = "魔泉",
}
