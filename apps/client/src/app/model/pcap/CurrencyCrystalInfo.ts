import { BasePacket } from './BasePacket';

export interface CurrencyCrystalInfo extends BasePacket {
  containerSequence: number;
  containerId: number;
  slot: number;
  quantity: number;
  catalogId: number;
}