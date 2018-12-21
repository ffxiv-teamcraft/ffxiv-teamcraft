import { JobCategory } from '../garland-tools/job-category';
import { Venture } from '../garland-tools/venture';

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
    nodes: any[];
    fish: any[];
    bait: any[];
  };
}
