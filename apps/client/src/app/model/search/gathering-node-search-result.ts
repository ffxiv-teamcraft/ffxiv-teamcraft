import { BaseSearchResult } from './base-search-result';
import { LazyNode } from '../../lazy-data/model/lazy-node';

export interface GatheringNodeSearchResult extends BaseSearchResult {
  id: number;
  node: LazyNode;
}
