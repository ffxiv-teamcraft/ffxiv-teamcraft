import { BasePacket } from './BasePacket';

export interface DesynthResult extends BasePacket {
  unknown0: number;
  unknown1: number;
  itemId: number;
  itemHq: boolean;
  itemResultId: number;
  itemResultHq: boolean;
  itemResultQuantity: number;
}
