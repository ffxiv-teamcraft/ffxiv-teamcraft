import { CraftworksObject } from '../craftworks-object';

export interface WorkshopPlanning {
  rest?: boolean;
  unknown?: boolean;
  planning: (CraftworksObject & { alternative: CraftworksObject })[];
}
