import { LazyIslandCraftwork } from '../../lazy-data/model/lazy-island-craftwork';
import { LazyIslandPopularity } from '../../lazy-data/model/lazy-island-popularity';

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
}
