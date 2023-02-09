import { BaseSearchResult } from './base-search-result';

export interface QuestSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  banner: string;
}
