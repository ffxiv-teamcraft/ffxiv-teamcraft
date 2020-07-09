import { InventoryEventType } from './inventory-event-type';

export interface InventoryEvent {
  type: InventoryEventType;
  itemId: number;
  amount: number;
  containerId: number;
  retainerName: string;
}
