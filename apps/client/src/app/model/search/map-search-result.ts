import { BaseSearchResult } from './base-search-result';

export interface MapSearchResult extends BaseSearchResult {
  id: number;
  zoneid: number;
}
