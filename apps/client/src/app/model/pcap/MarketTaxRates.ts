import { BasePacket } from './BasePacket';

export interface MarketTaxRates extends BasePacket {
  unknown1: number;
  unknown2: number;
  limsaLominsa: number;
  gridania: number;
  uldah: number;
  ishgard: number;
  kugane: number;
  crystarium: number;
  unknown3: number;
}