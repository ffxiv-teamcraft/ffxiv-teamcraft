import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';

export abstract class InventoryOptimization {
  public abstract getId(): string;

  public abstract matches(item: InventoryItem, inventory: UserInventory): boolean;

  public abstract getMessage(): { key: string, params: { [index: string]: number | string } };

  public isIgnored(): boolean {
    return localStorage.getItem(`optimization:${this.getId()}:ignored`) === 'true';
  }
}
