import { GatheringNode } from '@ffxiv-teamcraft/types';

export interface GatheredBy {
  type: number;
  level: number;
  nodes: GatheringNode[];
  stars_tooltip: string;
  folklore?: number;
}
