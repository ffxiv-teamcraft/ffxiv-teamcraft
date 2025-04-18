import { SpearfishingShadowSize, SpearfishingSpeed } from '../game';
import { FishingBait } from './fishing-bait';

export interface GatheringNode {
  id: number;
  items: number[];
  hiddenItems?: number[];
  sublimeItems?: {
    source: number;
    sublime: number;
  }[];
  limited?: boolean;
  level: number;
  type: number;
  perceptionReq?: number;
  legendary?: boolean;
  ephemeral?: boolean;
  spawns?: number[];
  duration?: number;
  zoneId: number;
  map?: number;
  x?: number;
  y?: number;
  z?: number;
  folklore?: number;
  isIslandNode?: boolean;
  /**
   * Fishing stuff
   */
  predators?: { id: number, amount: number }[];
  hookset?: number;
  baits?: FishingBait[];
  weathers?: number[];
  weathersFrom?: number[];
  snagging?: boolean;
  tug?: number;
  oceanFishingTime?: number;
  minGathering?: number;
  radius?: number;
  aLure?: number;
  mLure?: number;

  /**
   * Spearfishing stuff
   */
  speed?: SpearfishingSpeed;
  shadowSize?: SpearfishingShadowSize;

  /**
   * Search stuff
   */
  matchingItemId?: number;
  matchingItemIsHidden?: boolean;
  matchingItemSublime?: number;
  isReduction?: boolean;
}
