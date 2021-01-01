import { GatheringNode } from '../../../core/data/model/gathering-node';

export interface GatheredBy {
  type: number;
  icon: string;
  level: number;
  nodes: GatheringNode[];
  stars_tooltip: string;
  folklore?: number;
}
