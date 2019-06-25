import { BaseSearchResult } from './base-search-result';

export interface MobSearchResult extends BaseSearchResult {
  id: number;
  icon: string;
  zoneid: number;
}
