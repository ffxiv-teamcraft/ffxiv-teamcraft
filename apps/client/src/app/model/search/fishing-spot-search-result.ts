import { BaseSearchResult } from './base-search-result';

export interface FishingSpotSearchResult extends BaseSearchResult {
  id: number;
  spot: any;
}
