import { FishingBait } from './fishing-bait';

export interface GatheringNode {
  id: number;
  items: number[];
  hiddenItems?: number[];
  limited: boolean;
  level: number;
  type: number;
  legendary: boolean;
  ephemeral: boolean;
  spawns?: number[];
  duration?: number;
  zoneId: number;
  map: number;
  x: number;
  y: number;
  z: number;
  folklore?: number;
  /**
   * Fishing stuff
   */
  predators?: { id: number, amount: number }[];
  hookset?: 'powerful' | 'precision';
  baits?: FishingBait[];
  weathers?: number[];
  weathersFrom?: number[];
  snagging?: boolean;
  gig?: 'Small' | 'Normal' | 'Large';
  tug?: number;

  /**
   * Search stuff
   */
  matchingItemId?: number;
  matchingItemIsHidden?: boolean;
  isReduction?: boolean;
}
