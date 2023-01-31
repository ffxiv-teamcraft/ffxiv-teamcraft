import { BaseSearchResult } from './base-search-result';

export interface AchievementSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  data: any;
}
