import { ActorControl } from './ActorControl';

export interface FishingBaitMsg extends ActorControl {
  baitID: number;
  param2: number;
  param3: number;
  param4: number;
  param5: number;
}