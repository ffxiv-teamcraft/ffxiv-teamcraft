import { StoredNode } from './stored-node';

export interface GatheredBy {
  type: number;
  icon: string;
  level: number;
  nodes: StoredNode[];
  stars_tooltip: string;
  folklore?: number;
}
