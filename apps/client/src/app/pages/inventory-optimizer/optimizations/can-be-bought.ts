import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { beastTribeNpcs } from '../../../core/data/sources/beast-tribe-npcs';
import { DataType, ExtractRow, getItemSource, LazyDataKey } from '@ffxiv-teamcraft/types';
import { Injectable } from '@angular/core';
import { min } from 'lodash';
import { Vendor } from '../../../modules/list/model/vendor';
import { Observable, of } from 'rxjs';

@Injectable()
export class CanBeBought extends InventoryOptimizer {

  public static readonly MAXIMUM_PRICE_KEY = 'optimizer:can-be-bought:maximum-price';

  _getOptimization(item: InventoryItem, inventory: UserInventory, data: ExtractRow): Observable<{ [p: string]: number | string } | null> {
    const maximumPrice = +(localStorage.getItem(CanBeBought.MAXIMUM_PRICE_KEY) || 50000);
    if (!item.hq && data) {
      const vendors = getItemSource<Vendor[]>(data, DataType.VENDORS);
      const nonBeastTribeVendors = vendors.filter(v => !beastTribeNpcs.includes(v.npcId));
      const minPrice = min(nonBeastTribeVendors.map(v => v.price));
      if (nonBeastTribeVendors.length > 0 && minPrice < maximumPrice) {
        return of({});
      }
    }
    return of(null);
  }

  getId(): string {
    return 'CAN_BE_BOUGHT';
  }

  lazyDataEntriesNeeded(): LazyDataKey[] {
    return [];
  }
}
