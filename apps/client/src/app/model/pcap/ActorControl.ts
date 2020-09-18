import { BasePacket } from './BasePacket';

export interface ActorControl extends BasePacket {
  category: number;
  padding: number;
  param1: number;
  param2: number;
  param3: number;
  param4: number;
  param5: number;
  padding1: number;
}