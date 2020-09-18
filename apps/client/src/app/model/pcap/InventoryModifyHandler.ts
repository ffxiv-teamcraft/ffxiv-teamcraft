import { BasePacket } from './BasePacket';

export interface InventoryModifyHandler extends BasePacket {
  sequence: number;
  action: 'discard' | 'move' | 'swap' | 'merge' | 'split';
  fromContainer: number;
  fromSlot: number;
  toContainer: number;
  toSlot: number;
  splitCount: number;
}