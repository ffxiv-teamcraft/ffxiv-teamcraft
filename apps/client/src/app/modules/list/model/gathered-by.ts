import { GatheringNode } from '../../../core/data/model/gathering-node';

export interface GatheredBy {
  type: number;
  level: number;
  nodes: GatheringNode[];
  stars_tooltip: string;
  folklore?: number;
}
