import { InventoryOptimizer } from './inventory-optimizer';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { LazyDataKey } from '@ffxiv-teamcraft/types';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { ListController } from '../../../modules/list/list-controller';

@Injectable()
export class NotInList extends InventoryOptimizer {

  constructor(private listsFacade: ListsFacade) {
    super();
  }

  _getOptimization(item: InventoryItem): Observable<{ [p: string]: number | string } | null> {
    this.listsFacade.loadMyLists();
    return this.listsFacade.loadingMyLists$.pipe(
      filter(loading => !loading),
      switchMap(() => {
        return this.listsFacade.myLists$.pipe(
          first(),
          map(lists => {
            const usedInLists = lists.some(list => !list.archived && ListController.getItemById(list, item.itemId));
            if (usedInLists) {
              return null;
            }
            return {};
          })
        );
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
