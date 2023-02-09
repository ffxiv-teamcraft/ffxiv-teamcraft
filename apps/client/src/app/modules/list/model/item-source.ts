import { DataType } from '../data/data-type';
import { CraftedBy } from './crafted-by';
import { TradeSource } from './trade-source';
import { Vendor } from './vendor';
import { GatheredBy } from './gathered-by';
import { GardeningData } from './gardening-data';
import { I18nName } from '@ffxiv-teamcraft/types';
import { Drop } from './drop';
import { Alarm } from '../../../core/alarms/alarm';
import { CompactMasterbook } from '../../../model/common/compact-masterbook';
import { FateData } from './fate-data';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { MogstationItem } from './mogstation-item';
import { IslandAnimal } from './island-animal';
import { IslandCrop } from './island-crop';
import { TripleTriadDuel } from '../../../pages/db/model/attt/triple-triad-duel';

export interface CraftedBySource {
  type: DataType.CRAFTED_BY;
  data: CraftedBy[];
}

export interface TradeSourcesSource {
  type: DataType.TRADE_SOURCES;
  data: TradeSource[];
}

export interface VendorSource {
  type: DataType.VENDORS;
  data: Vendor[];
}

export interface OtherSource {
  type: DataType.REDUCED_FROM | DataType.DESYNTHS | DataType.VENTURES | DataType.TREASURES | DataType.INSTANCES | DataType.QUESTS;
  data: number[];
}

export interface GatheredBySource {
  type: DataType.GATHERED_BY;
  data: GatheredBy;
}

export interface GardeningDataSource {
  type: DataType.GARDENING;
  data: GardeningData;
}

export interface I18nNameSource {
  type: DataType.VOYAGES;
  data: I18nName[];
}

export interface DropSource {
  type: DataType.DROPS;
  data: Drop[];
}

export interface AlarmSource {
  type: DataType.ALARMS;
  data: Alarm[];
}

export interface CompactMasterbookSource {
  type: DataType.MASTERBOOKS;
  data: CompactMasterbook[];
}

export interface FateDataSource {
  type: DataType.FATES;
  data: FateData[];
}

export interface IngredientSource {
  type: DataType.REQUIREMENTS;
  data: Ingredient[];
}

export interface MogstationItemSource {
  type: DataType.MOGSTATION;
  data: MogstationItem;
}

export interface IslandAnimalSource {
  type: DataType.ISLAND_PASTURE;
  data: IslandAnimal[];
}

export interface IslandCropSource {
  type: DataType.ISLAND_CROP;
  data: IslandCrop;
}

export interface TripleTriadDuelsSource {
  type: DataType.TRIPLE_TRIAD_DUELS;
  data: TripleTriadDuel[];
}

export interface TripleTriadPackSource {
  type: DataType.TRIPLE_TRIAD_PACK;
  data: {
    id: number,
    price: number
  };
}

export interface DeprecatedSource {
  type: DataType.DEPRECATED;
  data: null;
}

export type ItemSource =
  | CraftedBySource
  | TradeSourcesSource
  | VendorSource
  | OtherSource
  | GatheredBySource
  | GardeningDataSource
  | I18nNameSource
  | DropSource
  | AlarmSource
  | CompactMasterbookSource
  | FateDataSource
  | IngredientSource
  | MogstationItemSource
  | IslandAnimalSource
  | IslandCropSource
  | TripleTriadDuelsSource
  | TripleTriadPackSource
  | DeprecatedSource
