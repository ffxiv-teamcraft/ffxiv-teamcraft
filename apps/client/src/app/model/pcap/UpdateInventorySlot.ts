import { BasePacket } from './BasePacket';

export interface UpdateInventorySlot extends BasePacket {
  sequence: number;
  unknown: number;
  containerId: number;
  slot: number;
  quantity: number;
  catalogId: number;
  reservedFlag: number;
  signatureId : number;
  hqFlag: number;
  unknown2: number;
  condition: number;
  spiritBond: number;
  color: number;
  glamourCatalogId: number;
  materia: [number, number, number, number, number];
}