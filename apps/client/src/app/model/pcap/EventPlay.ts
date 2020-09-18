import { BasePacket } from './BasePacket';

export interface EventPlay extends BasePacket {
  actorId: string;
  eventId: number;
  scene: number;
  padding: number;
  sceneFlags: number;
  unknown: number;
  paramSize: number;
}