import { Component, EventEmitter, Input, Output } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SettingsService } from '../../settings/settings.service';
import { InventoryService } from '../../inventory/inventory.service';
import { observeInput } from '../../../core/rxjs/observe-input';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryPositionComponent } from '../../inventory/inventory-position/inventory-position.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-item-inventory-button',
    templateUrl: './item-inventory-button.component.html',
    styleUrls: ['./item-inventory-button.component.less'],
    standalone: true,
    imports: [NzTagModule, NzDropDownModule, NzMenuModule, NzButtonModule, NzToolTipModule, FlexModule, InventoryPositionComponent, AsyncPipe, TranslateModule]
})
export class ItemInventoryButtonComponent {

  @Input()
  itemId: number;

  itemId$ = observeInput(this, 'itemId');

  @Input()
  permissionLevel: number;

  @Output()
  add = new EventEmitter<number>();

  amountInInventory$: Observable<{ containerName: string, amount: number, hq: boolean, isRetainer: boolean }[]> =
    combineLatest(([this.settings.settingsChange$.pipe(startWith(0)), this.inventoryService.inventory$, this.itemId$])).pipe(
      map(([, inventory, itemId]) => {
        return inventory.getItem(itemId)
          .filter(entry => {
            return !this.settings.ignoredInventories.includes(this.inventoryService.getContainerTranslateKey(entry))
              && (this.settings.showOthercharacterInventoriesInList || entry.isCurrentCharacter);
          })
          .map(entry => {
            return {
              item: entry,
              isRetainer: entry.retainerName !== undefined,
              containerName: this.inventoryService.getContainerDisplayName(entry),
              amount: entry.quantity,
              hq: entry.hq
            };
          }).reduce((res, entry) => {
            const resEntry = res.find(e => e.containerName === entry.containerName && e.hq === entry.hq);
            if (resEntry !== undefined) {
              resEntry.amount += entry.amount;
            } else {
              res.push(entry);
            }
            return res;
          }, []);
      })
    );

  totalAmountInInventory$: Observable<{ hq: number, nq: number }> = this.amountInInventory$.pipe(
    map(rows => {
      return rows.reduce((acc, row) => {
        if (row.hq) {
          acc.hq += row.amount;
        } else {
          acc.nq += row.amount;
        }
        if (acc.containers.indexOf(row.containerName) === -1) {
          acc.containers.push(row.containerName);
        }
        return acc;
      }, {
        containers: [],
        hq: 0,
        nq: 0
      });
    })
  );

  constructor(private settings: SettingsService, private inventoryService: InventoryService) {
  }

  addAmount(amount: number): void {
    this.add.emit(amount);
  }

  trackByInventoryEntry(index: number, entry: { containerName: string, amount: number, hq: boolean }): string {
    return `${entry.containerName}${entry.hq}`;
  }
}
