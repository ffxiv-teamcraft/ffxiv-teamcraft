import { BasePacket } from './BasePacket';

export interface AirshipStatusList extends BasePacket {
  unlockedAirshipCount: number;

  unknown0: number;
  unknown1: number;
  unknown2: number;

  statusList: {
    birthdate: number;
    returnTime: number;
    status: number;
    rank: number;
    name: string;
    padding: string;
  }[];

  unlockedSectors: boolean[];
  exploredSectors: boolean[];

  unknown3: number;
}
