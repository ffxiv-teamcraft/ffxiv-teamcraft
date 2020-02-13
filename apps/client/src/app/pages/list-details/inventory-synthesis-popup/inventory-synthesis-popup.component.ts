import { Component, OnInit } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';

@Component({
  selector: 'app-inventory-synthesis-popup',
  templateUrl: './inventory-synthesis-popup.component.html',
  styleUrls: ['./inventory-synthesis-popup.component.less']
})
export class InventorySynthesisPopupComponent implements OnInit {

  list: List;

  synthesis$: Observable<{containerName: string, isRetainer: boolean, items: InventoryItem[]}[]>;

  removeDone$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.settings.removeDoneInInventorSynthesis);

  constructor(private inventoryFacade: InventoryFacade, private settings: SettingsService) {
  }

  setRemoveDone(remove: boolean): void {
    this.removeDone$.next(remove);
    this.settings.removeDoneInInventorSynthesis = remove;
  }

  ngOnInit() {
    this.synthesis$ = combineLatest([this.inventoryFacade.inventory$, this.removeDone$]).pipe(
      map(([inventory, removeDone]) => {
        const finalItems = [];
        this.list.finalItems
          .filter(item => {
            if (removeDone) {
              return item.done < item.amount;
            }
            return true;
          })
          .forEach(finalItem => {
            finalItems.push(...inventory.getItem(finalItem.id, false));
          });
        const items = [];
        this.list.items
          .filter(item => {
            if (removeDone) {
              return item.done < item.amount;
            }
            return true;
          })
          .forEach(item => {
            items.push(...inventory.getItem(item.id, false));
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

}
