import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { LazyDataKey } from '@ffxiv-teamcraft/types';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { first, map } from 'rxjs/operators';

@Injectable()
export class NotInList extends InventoryOptimizer {

  constructor(private listsFacade: ListsFacade) {
    super();
  }

  _getOptimization(item: InventoryItem): Observable<{ [p: string]: number | string } | null> {
    this.listsFacade.loadMyLists();
    return this.listsFacade.myLists$.pipe(
      first(),
      map(lists => {
        if (!lists.some(list => {
          return list.finalItems.some(i => i.id === item.itemId)
            && list.items.some(i => i.id === item.itemId);
        })) {
          return {};
        }
        return null;
      })
    );
  }

  getId(): string {
    return 'NOT_IN_LIST';
  }

  lazyDataEntriesNeeded(): LazyDataKey[] {
    return [];
  }
}
