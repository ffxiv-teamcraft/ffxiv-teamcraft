import { Vector3 } from '../../core';
import { FishingBait } from '../../data';
import { SpearfishingShadowSize, SpearfishingSpeed } from '../../game';

export interface AlarmDetails {
  itemId: number;
  nodeId: number;
  duration: number;
  mapId: number;
  zoneId: number;
  areaId: number;
  type: number;
  coords: Vector3;
  spawns: number[];
  folklore?: number;
  bnpcName?: number;
  reduction?: boolean;
  ephemeral?: boolean;
  nodeContent?: number[];
  weathers?: number[];
  weathersFrom?: number[];
  snagging?: boolean;
  predators?: { id: number, amount: number }[];
  fishEyes?: boolean;
  speed?: SpearfishingSpeed;
  shadowSize?: SpearfishingShadowSize;
  baits?: FishingBait[];
  hookset?: number;
}
