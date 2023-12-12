import { Component, OnInit } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { ListRow } from '../../../modules/list/model/list-row';
import { topologicalSort } from '../../../core/tools/topological-sort';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { InventoryPositionComponent } from '../../../modules/inventory/inventory-position/inventory-position.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-inventory-synthesis-popup',
    templateUrl: './inventory-synthesis-popup.component.html',
    styleUrls: ['./inventory-synthesis-popup.component.less'],
    standalone: true,
    imports: [FlexModule, NzCheckboxModule, FormsModule, NgIf, NgFor, NzCardModule, ItemIconComponent, NzButtonModule, NzIconModule, NzToolTipModule, InventoryPositionComponent, AsyncPipe, I18nPipe, TranslateModule, ItemNamePipe]
})
export class InventorySynthesisPopupComponent implements OnInit {

  list: List;

  // items are InventoryItem + needed:number
  synthesis$: Observable<{ containerName: string, isRetainer: boolean, items: any[] }[]>;

  removeDone$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.settings.removeDoneInInventorSynthesis);

  constructor(private inventoryFacade: InventoryService, private settings: SettingsService) {
  }

  setRemoveDone(remove: boolean): void {
    this.removeDone$.next(remove);
    this.settings.removeDoneInInventorSynthesis = remove;
  }

  ngOnInit() {
    this.synthesis$ = combineLatest([this.inventoryFacade.inventory$, this.removeDone$]).pipe(
      map(([inventory, removeDone]) => {
        const finalItems = [];
        topologicalSort(this.list.finalItems)
          .filter(item => {
            if (removeDone) {
              return item.done < item.amount;
            }
            return true;
          })
          .forEach(finalItem => {
            finalItems.push(...inventory.getItem(finalItem.id).map(inventoryItem => {
              return {
                ...inventoryItem,
                needed: finalItem.amount - finalItem.done
              };
            }));
          });
        const items = [];
        topologicalSort(this.list.items)
          .filter(item => {
            if (removeDone) {
              return item.done < item.amount;
            }
            return true;
          })
          .forEach(item => {
            items.push(...inventory.getItem(item.id).map(inventoryItem => {
              return {
                ...inventoryItem,
                needed: item.amount - item.done
              };
            }));
          });

        return [...finalItems, ...items].reduce((report, item) => {
          const containerName = item.retainerName ? item.retainerName : this.inventoryFacade.getContainerName(item.containerId);
          let entry = report.find(e => e.containerName === containerName);
          if (entry === undefined) {
            report.push({
              containerName: containerName,
              isRetainer: item.retainerName !== undefined,
              items: []
            });
            entry = report[report.length - 1];
          }
          entry.items.push(item);
          return report;
        }, []);
      })
    );
  }

  trackByRow(index: number, row: { containerName: string, isRetainer: boolean, items: any[] }): string {
    return row.containerName;
  }

}

