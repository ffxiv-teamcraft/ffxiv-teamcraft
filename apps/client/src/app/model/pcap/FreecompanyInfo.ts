import { BasePacket } from './BasePacket';

export interface FreecompanyInfo extends BasePacket {
  fcId: number;
  fcRank: number;
}
