import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { InjectionToken } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { ContainerType } from '../../../model/user/inventory/container-type';

export const INVENTORY_OPTIMIZER: InjectionToken<InventoryOptimizer> = new InjectionToken('InventoryOptimizer');

export abstract class InventoryOptimizer {

  protected static IGNORED_CONTAINERS = [
    ContainerType.TradeInventory,
    ContainerType.FreeCompanyBag0,
    ContainerType.FreeCompanyBag1,
    ContainerType.FreeCompanyBag2,
    ContainerType.FreeCompanyBag3,
    ContainerType.FreeCompanyBag4,
    ContainerType.FreeCompanyBag5,
    ContainerType.FreeCompanyBag6,
    ContainerType.FreeCompanyBag7,
    ContainerType.FreeCompanyBag8,
    ContainerType.FreeCompanyBag9,
    ContainerType.FreeCompanyBag10,
    ContainerType.RetainerMarket,
    ContainerType.RetainerEquippedGear,
    ContainerType.Crystal,
    ContainerType.RetainerCrystal,
    ContainerType.HandIn,
    ContainerType.RetainerGil,
    ContainerType.FreeCompanyGil
  ];

  /// Compare two InventoryItem objects to determine whether they consume the same slot in the same
  /// container.
  protected static inSameSlot(source: InventoryItem, target: InventoryItem): boolean {
    return source.slot === target.slot && source.containerId === target.containerId;
  }

  public getOptimization(item: InventoryItem, inventory: UserInventory, extracts: ListRow[]): { [p: string]: number | string } | null {
    if (InventoryOptimizer.IGNORED_CONTAINERS.indexOf(item.containerId) > -1) {
      return null;
    }
    const data = extracts.find(i => i.id === item.itemId);
    return this._getOptimization(item, inventory, data);
  }

  protected abstract _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null;

  public abstract getId(): string;
}
