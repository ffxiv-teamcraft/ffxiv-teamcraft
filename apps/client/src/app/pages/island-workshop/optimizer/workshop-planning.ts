import { CraftworksObject } from '../craftworks-object';

export interface WorkshopPlanning {
  rest?: boolean;
  unknown?: boolean;
  score: number;
  groove: number;
  planning: (CraftworksObject & { alternative: CraftworksObject })[];
}
