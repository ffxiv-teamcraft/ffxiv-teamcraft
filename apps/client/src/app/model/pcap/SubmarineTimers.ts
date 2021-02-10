import { BasePacket } from './BasePacket';

export interface SubmarineTimers extends BasePacket{
  timersList: {
    returnTime: number;
    submarineSpeed: number;

    unknown0: number;

    name: string;

    padding1: number;
    padding2: number;

    dest1: number;
    dest2: number;
    dest3: number;
    dest4: number;
    dest5: number;
  }[];
}
