import { LazyIslandCraftwork } from '../../lazy-data/model/lazy-island-craftwork';
import { LazyIslandPopularity } from '../../lazy-data/model/lazy-island-popularity';
import { WorkshopPattern } from './workshop-patterns';

export interface CraftworksObject {
  id: number;
  supply: number;
  demand: number;
  itemId: number;
  craftworksEntry: LazyIslandCraftwork;
  popularity: LazyIslandPopularity;
  predictedPopularity: LazyIslandPopularity;

  supplyKey?: string;
  supplyIcon?: null[];
  demandKey?: string;
  popularityKey?: string;
  predictedPopularityKey?: string;
  patterns?: { index: number, day: number, pattern: WorkshopPattern, strong: boolean }[];
  hasPeaked?: boolean;
  willPeak?: boolean;
  isPeaking?: boolean;
}
