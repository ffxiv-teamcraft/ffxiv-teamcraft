import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryPositionComponent } from '../../../modules/inventory/inventory-position/inventory-position.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-inventory-cleanup-popup',
    templateUrl: './inventory-cleanup-popup.component.html',
    styleUrls: ['./inventory-cleanup-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzCardModule, NgFor, ItemIconComponent, I18nNameComponent, NzButtonModule, NzIconModule, NzToolTipModule, InventoryPositionComponent, AsyncPipe, TranslateModule]
})
export class InventoryCleanupPopupComponent implements OnInit {

  list: List;

  // items are InventoryItem + needed:number
  cleanup$: Observable<InventoryItem[]>;

  constructor(private inventoryFacade: InventoryService) {
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
