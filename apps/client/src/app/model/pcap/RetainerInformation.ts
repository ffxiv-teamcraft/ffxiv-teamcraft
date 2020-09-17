import { BasePacket } from './BasePacket';

export interface RetainerInformation extends BasePacket {
  retainerID: number;
  hireOrder: number;
  itemCount: number;
  gil: number;
  itemSellingCount: number;
  cityID: number;
  classJobID: number;
  level: number;
  ventureID: number;
  ventureComplete: number;
  name: string;
}