import { BasePacket } from './BasePacket';

export interface PrepareZoning extends BasePacket {
  logMessage: number;
  targetZone: number;
  animation: number;
  hideChar: number;
  fadeOut: number;
  fadeOutTime: number;
}