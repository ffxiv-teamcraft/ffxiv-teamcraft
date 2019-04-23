import { SearchResult } from '../../model/search/search-result';

export interface DesynthSearchResult extends SearchResult {
  dlvl: number;
  score: number;
}
