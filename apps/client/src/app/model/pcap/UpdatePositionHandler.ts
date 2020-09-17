import { BasePacket } from './BasePacket';

export interface UpdatePositionHandler extends BasePacket {
  rotation: number;
  animationType: number;
  animationState: number;
  clientAnimationType: number;
  headPosition: number;
  pos: {
    x: number;
    y: number;
    z: number;
  };
  unknown: number[];
}