import { BasePacket } from './BasePacket';

export interface AirshipStatus extends BasePacket {
  returnTime: number,
  status: number,
  rank: number,
  capacity: number,

  unknown0: number,

  currentExp: number,
  totalExpForNextRank: number,
  unlockedAirshipCount: number,
  hull: number,
  rigging: number,
  forecastle: number,
  aftcastle: number,
  dest1: number,
  dest2: number,
  dest3: number,
  dest4: number,
  dest5: number,
  name: string,

  padding1: number;
  padding2: number;

  unlockedSectors: boolean[];
  exploredSectors: boolean[];

  unknown1: number;
  unknown2: number;
}
