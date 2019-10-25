import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { InventoryPartialState } from './inventory.reducer';
import { inventoryQuery } from './inventory.selectors';
import { LoadInventory, UpdateInventory } from './inventory.actions';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InventoryFacade {
  loaded$ = this.store.pipe(select(inventoryQuery.getLoaded));

  inventory$ = this.store.pipe(
    select(inventoryQuery.getInventory),
    filter(inventory => inventory !== null),
    map(inventory => inventory.clone())
  );

  constructor(private store: Store<InventoryPartialState>) {
  }

  public getContainerName(containerId: number): string {
    switch (containerId) {
      case ContainerType.Bag0:
      case ContainerType.Bag1:
      case ContainerType.Bag2:
      case ContainerType.Bag3:
        return 'Bag';
      case ContainerType.RetainerBag0:
      case ContainerType.RetainerBag1:
      case ContainerType.RetainerBag2:
      case ContainerType.RetainerBag3:
      case ContainerType.RetainerBag4:
      case ContainerType.RetainerBag5:
      case ContainerType.RetainerBag6:
        return 'RetainerBag';
      case ContainerType.SaddleBag0:
      case ContainerType.SaddleBag1:
      case ContainerType.PremiumSaddleBag0:
      case ContainerType.PremiumSaddleBag1:
        return 'SaddleBag';
      case ContainerType.FreeCompanyBag0:
      case ContainerType.FreeCompanyBag1:
      case ContainerType.FreeCompanyBag2:
        return 'FC_chest';
    }
    return 'Other';
  }

  load() {
    this.store.dispatch(new LoadInventory());
  }

  updateInventory(inventory: UserInventory, force = false): void {
    this.store.dispatch(new UpdateInventory(inventory, force));
  }
}
