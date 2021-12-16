export interface LazyDiademTerritory {
  AchievementIndex:          string;
  Aetheryte:                 null;
  AetheryteTarget:           string;
  AetheryteTargetID:         number;
  ArrayEventHandler:         null;
  ArrayEventHandlerTarget:   string;
  ArrayEventHandlerTargetID: number;
  BGM:                       null;
  BGMTarget:                 string;
  BGMTargetID:               number;
  BattalionMode:             number;
  Bg:                        string;
  Bg_en:                     string;
  ExclusiveType:             number;
  FixedTime:                 string;
  GameContentLinks:          GameContentLinks;
  ID:                        number;
  IsPvpZone:                 number;
  LoadingImage:              LoadingImage;
  LoadingImageTarget:        string;
  LoadingImageTargetID:      number;
  Map:                       LazyDiademTerritoryMap;
  MapTarget:                 string;
  MapTargetID:               number;
  Mount:                     number;
  Name:                      string;
  Name_en:                   string;
  PCSearch:                  number;
  Patch:                     number;
  PlaceName:                 PlaceName;
  PlaceNameIcon:             string;
  PlaceNameIconID:           number;
  PlaceNameRegion:           PlaceName;
  PlaceNameRegionIcon:       string;
  PlaceNameRegionIconID:     number;
  PlaceNameRegionTarget:     string;
  PlaceNameRegionTargetID:   number;
  PlaceNameTarget:           string;
  PlaceNameTargetID:         number;
  PlaceNameZone:             PlaceName;
  PlaceNameZoneTarget:       string;
  PlaceNameZoneTargetID:     number;
  QuestBattle:               null;
  QuestBattleTarget:         string;
  QuestBattleTargetID:       number;
  Resident:                  number;
  Stealth:                   number;
  TerritoryIntendedUse:      number;
  Url:                       string;
  WeatherRate:               number;
}

export interface GameContentLinks {
  ContentFinderCondition: ContentFinderCondition;
  GatheringPoint:         ContentFinderCondition;
  Map:                    ContentFinderCondition;
}

export interface ContentFinderCondition {
  TerritoryType: number[];
}

export interface LoadingImage {
  ID: number;
}

export interface LazyDiademTerritoryMap {
  DiscoveryArrayByte:      number;
  DiscoveryFlag:           number;
  DiscoveryIndex:          number;
  Hierarchy:               number;
  ID:                      number;
  IsEvent:                 number;
  MapCondition:            null;
  MapConditionTarget:      string;
  MapConditionTargetID:    number;
  MapFilename:             string;
  MapFilenameId:           string;
  MapIndex:                number;
  MapMarkerRange:          number;
  OffsetX:                 number;
  OffsetY:                 number;
  PlaceName:               PlaceName;
  PlaceNameRegion:         PlaceName;
  PlaceNameRegionTarget:   string;
  PlaceNameRegionTargetID: number;
  PlaceNameSub:            null;
  PlaceNameSubTarget:      string;
  PlaceNameSubTargetID:    number;
  PlaceNameTarget:         string;
  PlaceNameTargetID:       number;
  PriorityCategoryUI:      number;
  PriorityUI:              number;
  SizeFactor:              number;
  TerritoryType:           TerritoryType;
  TerritoryTypeTarget:     string;
  TerritoryTypeTargetID:   number;
}

export interface PlaceName {
  ID:               number;
  Icon:             string;
  Name:             string;
  NameNoArticle:    string;
  NameNoArticle_de: string;
  NameNoArticle_en: string;
  NameNoArticle_fr: string;
  NameNoArticle_ja: string;
  Name_de:          string;
  Name_en:          string;
  Name_fr:          string;
  Name_ja:          string;
}

export interface TerritoryType {
  AchievementIndex:          string;
  Aetheryte:                 null;
  AetheryteTarget:           string;
  AetheryteTargetID:         number;
  ArrayEventHandler:         null;
  ArrayEventHandlerTarget:   string;
  ArrayEventHandlerTargetID: number;
  BGM:                       null;
  BGMTarget:                 string;
  BGMTargetID:               number;
  BattalionMode:             number;
  Bg:                        string;
  Bg_en:                     string;
  ExclusiveType:             number;
  FixedTime:                 string;
  ID:                        number;
  IsPvpZone:                 number;
  LoadingImage:              LoadingImage;
  LoadingImageTarget:        string;
  LoadingImageTargetID:      number;
  Map:                       TerritoryTypeMap;
  MapTarget:                 string;
  MapTargetID:               number;
  Mount:                     number;
  Name:                      string;
  Name_en:                   string;
  PCSearch:                  number;
  PlaceName:                 PlaceName;
  PlaceNameIcon:             string;
  PlaceNameIconID:           number;
  PlaceNameRegion:           PlaceName;
  PlaceNameRegionIcon:       string;
  PlaceNameRegionIconID:     number;
  PlaceNameRegionTarget:     string;
  PlaceNameRegionTargetID:   number;
  PlaceNameTarget:           string;
  PlaceNameTargetID:         number;
  PlaceNameZone:             PlaceName;
  PlaceNameZoneTarget:       string;
  PlaceNameZoneTargetID:     number;
  QuestBattle:               null;
  QuestBattleTarget:         string;
  QuestBattleTargetID:       number;
  Resident:                  number;
  Stealth:                   number;
  TerritoryIntendedUse:      number;
  WeatherRate:               number;
}

export interface TerritoryTypeMap {
  DiscoveryArrayByte: number;
  DiscoveryFlag:      number;
  DiscoveryIndex:     number;
  Hierarchy:          number;
  ID:                 number;
  IsEvent:            number;
  MapCondition:       number;
  MapFilename:        string;
  MapFilenameId:      string;
  MapIndex:           number;
  MapMarkerRange:     number;
  OffsetX:            number;
  OffsetY:            number;
  PlaceName:          number;
  PlaceNameRegion:    number;
  PlaceNameSub:       number;
  PriorityCategoryUI: number;
  PriorityUI:         number;
  SizeFactor:         number;
  TerritoryType:      number;
}
