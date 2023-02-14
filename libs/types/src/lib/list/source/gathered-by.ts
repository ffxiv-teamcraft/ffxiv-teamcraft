import { GatheringNode } from "../../data/gathering-node";

export interface GatheredBy {
  type: number;
  level: number;
  nodes: GatheringNode[];
  stars_tooltip: string;
  folklore?: number;
}
