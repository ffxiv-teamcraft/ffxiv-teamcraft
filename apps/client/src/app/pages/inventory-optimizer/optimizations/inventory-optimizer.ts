import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { InjectionToken } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { ContainerType } from '../../../model/user/inventory/container-type';

export const INVENTORY_OPTIMIZER: InjectionToken<InventoryOptimizer> = new InjectionToken('InventoryOptimizer');

export abstract class InventoryOptimizer {

  protected static IGNORED_CONTAINERS = [
    ContainerType.TradeInventory,
    ContainerType.FreeCompanyBag0,
    ContainerType.FreeCompanyBag1,
    ContainerType.FreeCompanyBag2,
    ContainerType.RetainerMarket,
    ContainerType.RetainerEquippedGear,
    ContainerType.Crystal,
    ContainerType.RetainerCrystal,
    ContainerType.HandIn,
    ContainerType.RetainerGil,
    ContainerType.FreeCompanyGil
  ];

  public getOptimization(item: InventoryItem, inventory: UserInventory, lazyData: LazyDataService): { [p: string]: number | string } | null {
    if (InventoryOptimizer.IGNORED_CONTAINERS.indexOf(item.containerId) > -1) {
      return null;
    }
    const data = lazyData.extracts.find(i => i.id === item.itemId);
    return this._getOptimization(item, inventory, data);
  }

  protected abstract _getOptimization(item: InventoryItem, inventory: UserInventory, data: ListRow): { [p: string]: number | string } | null;

  public abstract getId(): string;
}
