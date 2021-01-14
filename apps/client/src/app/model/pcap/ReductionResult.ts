import { BasePacket } from './BasePacket';

export interface ReductionResult extends BasePacket {
  itemId: number;
  unknown2: number;
  result: {
    itemId: number;
    itemHq: boolean;
    itemQuantity: number;
  }[];
}
