import { BasePacket } from './BasePacket';

export interface SubmarineProgressionStatus extends BasePacket {
  unlockedSubmarineCount: number;
  unlockedSectors: boolean[];
  exploredSectors: boolean[];
}
