import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { List } from '../../../modules/list/model/list';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';

@Component({
  selector: 'app-inventory-cleanup-popup',
  templateUrl: './inventory-cleanup-popup.component.html',
  styleUrls: ['./inventory-cleanup-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryCleanupPopupComponent implements OnInit {

  list: List;

  // items are InventoryItem + needed:number
  cleanup$: Observable<InventoryItem[]>;

  constructor(private inventoryFacade: InventoryFacade) {
  }

  ngOnInit() {
    const allItemIds = [...this.list.items.map(i => i.id), ...this.list.finalItems.map(i => i.id)];
    this.cleanup$ = this.inventoryFacade.inventory$.pipe(
      map((inventory) => {
        return inventory.getFromContainers(ContainerType.Bag0, ContainerType.Bag1, ContainerType.Bag2, ContainerType.Bag3)
          .filter(item => !allItemIds.includes(item.itemId));
      })
    );
  }

  trackByRow(index: number, row: { containerName: string, isRetainer: boolean, items: any[] }): string {
    return row.containerName;
  }

}
