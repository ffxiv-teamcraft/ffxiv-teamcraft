import { FishingBait } from './fishing-bait';
import { SpearfishingShadowSize } from './spearfishing-shadow-size';
import { SpearfishingSpeed } from './spearfishing-speed';

export interface GatheringNode {
  id: number;
  items: number[];
  hiddenItems?: number[];
  limited?: boolean;
  level: number;
  type: number;
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
  isReduction?: boolean;
}
