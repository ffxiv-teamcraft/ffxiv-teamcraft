import { BasePacket } from './BasePacket';

export interface UpdatePositionInstance extends BasePacket {
  rotation: number;
  interpolateRotation: number;
  pos: {
    x: number;
    y: number;
    z: number;
  }
  interpolatePos: {
    x: number;
    y: number;
    z: number;
  }
}