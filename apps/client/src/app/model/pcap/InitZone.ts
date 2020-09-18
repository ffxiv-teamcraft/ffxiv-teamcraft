import { BasePacket } from './BasePacket';

export interface InitZone extends BasePacket {
  serverID: number;
  zoneID: number;
  unknown1: number;
  contentfinderConditionID: number;
  weatherID: number;
  bitmask: number;
  bitmask1: number;
  unknown5: number;
  unknown8: number;
  festivalID: number;
  additionalFestivalID: number;
  unknown9: number;
  unknown10: number;
  unknown11: number;
  unknown12: number[];
  pos: {
    x: number;
    y: number;
    z: number;
  };
  unknown13: number;
}