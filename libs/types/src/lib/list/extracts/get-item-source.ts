import { I18nName } from '../../i18n-name';
import { DataType } from '../data-type';
import { AlarmDetails, CompactMasterbook, Ingredient, TripleTriadDuel } from '../details-model';
import { CraftedBy, Drop, FateData, GardeningData, GatheredBy, IslandAnimal, IslandCrop, MogstationItem, TradeSource, Vendor } from '../source';
import { ExtractRow } from './extracts';
import { ItemSource } from './item-source';
import structuredClone from '@ungap/structured-clone';

export function getItemSource(item: ExtractRow, type: DataType.CRAFTED_BY, isObject?: boolean): CraftedBy[]
export function getItemSource(item: ExtractRow, type: DataType.TRADE_SOURCES, isObject?: boolean): TradeSource[]
export function getItemSource(item: ExtractRow, type: DataType.VENDORS, isObject?: boolean): Vendor[]
export function getItemSource(item: ExtractRow, type: DataType.REDUCED_FROM | DataType.DESYNTHS | DataType.VENTURES | DataType.TREASURES | DataType.INSTANCES | DataType.QUESTS, isObject?: boolean): number[]
export function getItemSource(item: ExtractRow, type: DataType.GATHERED_BY, isObject?: boolean): GatheredBy
export function getItemSource(item: ExtractRow, type: DataType.GARDENING, isObject?: boolean): GardeningData
export function getItemSource(item: ExtractRow, type: DataType.VOYAGES, isObject?: boolean): I18nName[]
export function getItemSource(item: ExtractRow, type: DataType.DROPS, isObject?: boolean): Drop[]
export function getItemSource(item: ExtractRow, type: DataType.ALARMS, isObject?: boolean): AlarmDetails[]
export function getItemSource(item: ExtractRow, type: DataType.MASTERBOOKS, isObject?: boolean): CompactMasterbook[]
export function getItemSource(item: ExtractRow, type: DataType.FATES, isObject?: boolean): FateData[]
export function getItemSource(item: ExtractRow, type: DataType.REQUIREMENTS, isObject?: boolean): Ingredient[]
export function getItemSource(item: ExtractRow, type: DataType.MOGSTATION, isObject?: boolean): MogstationItem
export function getItemSource(item: ExtractRow, type: DataType.ISLAND_PASTURE, isObject?: boolean): IslandAnimal[]
export function getItemSource(item: ExtractRow, type: DataType.ISLAND_CROP, isObject?: boolean): IslandCrop
export function getItemSource(item: ExtractRow, type: DataType.TRIPLE_TRIAD_DUELS, isObject?: boolean): TripleTriadDuel[]
export function getItemSource(item: ExtractRow, type: DataType.TRIPLE_TRIAD_PACK, isObject?: boolean): { id: number, price: number }
export function getItemSource<T = any>(item: ExtractRow, type: DataType, isObject?: boolean): T
export function getItemSource<T = any>(item: ExtractRow & { alarms?: AlarmDetails[] }, type: DataType, isObject = false): ItemSource['data'] {
  if (item.sources === undefined) {
    return (isObject ? {} : []) as any;
  }
  const source = item.sources.find(s => s.type === type);
  if (source === undefined) {
    if (type === DataType.ALARMS && item.alarms && item.alarms.length > 0) {
      return item.alarms;
    } else {
      return isObject ? {} : [] as any;
    }
  } else {
    return structuredClone(source.data);
  }
}
