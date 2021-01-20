import { BasePacket } from './BasePacket';

export interface SubmarineStatusList extends BasePacket {
  statusList: {
    status: number,
    rank: number,
    birthdate: number,
    returnTime: number,
    currentExp: number,
    totalExpForNextRank: number,
    capacity: number,
    name: string,
    hull: number,
    stern: number,
    bow: number,
    bridge: number,
    dest1: number,
    dest2: number,
    dest3: number,
    dest4: number,
    dest5: number,
  }[];
}
