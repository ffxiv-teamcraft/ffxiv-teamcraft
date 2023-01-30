import { BaseSearchResult } from './base-search-result';
import { LazyFishingSpot } from '@ffxiv-teamcraft/data/model/lazy-fishing-spot';

export interface FishingSpotSearchResult extends BaseSearchResult {
  id: number;
  spot: LazyFishingSpot;
}
