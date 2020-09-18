import { BasePacket } from './BasePacket';

export interface InventoryTransaction extends BasePacket {
  unknown: number;
  flag: number;
  padding: number;
  containerId: number;
  slot: number;
  padding2: number;
  quantity: number;
  catalogId: number;
  someActorId: number;
  targetStorageId: number;
}