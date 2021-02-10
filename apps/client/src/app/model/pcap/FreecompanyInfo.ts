import { BasePacket } from './BasePacket';

export interface FreecompanyInfo extends BasePacket {
  fcId: string;
  fcRank: number;
}
