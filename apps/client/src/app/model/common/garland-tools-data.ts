import { JobCategory } from '../garland-tools/job-category';
import { Venture } from '../garland-tools/venture';
import { GtFish } from './gt-fish';
import { GtNode } from './gt-node';

export interface GarlandToolsData {
  patch: any;
  xp: number[];
  jobs: any[];
  node: any;
  fishing: any;
  mob: any;
  location: any;
  skywatcher: any;
  quest: any;
  venture: any;
  npc: any;
  action: any;
  leve: any;
  achievement: any;
  instance: any;
  fate: any;
  item: {
    ingredients: any[]
  };
  instanceTypes: string[];
  jobCategories: JobCategory[];
  ventureIndex: Venture[];
  bell: {
    nodes: GtNode[];
    fish: GtFish[];
    bait: Record<string, { name: string, id: number, icon: number }>;
  };
}
