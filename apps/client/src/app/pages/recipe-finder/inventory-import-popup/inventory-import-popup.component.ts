import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { first, map } from 'rxjs/operators';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-inventory-import-popup',
    templateUrl: './inventory-import-popup.component.html',
    styleUrls: ['./inventory-import-popup.component.less'],
    standalone: true,
    imports: [FlexModule, NzSelectModule, FormsModule, NgFor, NzButtonModule, NzWaveModule, AsyncPipe, TranslateModule]
})
export class InventoryImportPopupComponent {

  public containers$: Observable<string[]> = this.inventoryFacade.inventory$.pipe(
    map(inventory => {
      return inventory.toArray()
        .reduce((acc, row) => {
          const containerName = this.getContainerName(row);
          if (!acc.some(name => name === containerName)) {
            return [
              ...acc,
              containerName
            ];
          }
          return acc;
        }, [])
        .filter(containerName => containerName !== 'Other Inventory');
    })
  );

  public selectedContainers: string[] = [];

  constructor(private inventoryFacade: InventoryService, private translate: TranslateService,
              private ref: NzModalRef) {
  }

  confirm(): void {
    this.inventoryFacade.inventory$.pipe(
      first(),
      map(inventory => {
        return inventory.toArray().filter(item => {
          return this.selectedContainers.indexOf(this.getContainerName(item)) > -1;
        });
      })
    ).subscribe(items => {
      this.ref.close(items);
    });
  }

  cancel(): void {
    this.ref.close([]);
  }

  private getContainerName(row: InventoryItem): string {
    return row.retainerName || this.translate.instant('INVENTORY.BAG.' + this.inventoryFacade.getContainerName(row.containerId));
  }

}
