import { Component, OnInit } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { ListRow } from '../../../modules/list/model/list-row';

@Component({
  selector: 'app-inventory-synthesis-popup',
  templateUrl: './inventory-synthesis-popup.component.html',
  styleUrls: ['./inventory-synthesis-popup.component.less']
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
        this.topologicalSort(this.list.finalItems)
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
        this.topologicalSort(this.list.items)
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

  private topologicalSort(data: ListRow[]): ListRow[] {
    const res: ListRow[] = [];
    const doneList: boolean[] = [];
    while (data.length > res.length) {
      let resolved = false;

      for (const item of data) {
        if (res.indexOf(item) > -1) {
          // item already in resultset
          continue;
        }
        resolved = true;

        if (item.requires !== undefined) {
          for (const dep of item.requires) {
            // We have to check if it's not a precraft, as some dependencies aren't resolvable inside the current array.
            const depIsInArray = data.find(row => row.id === dep.id) !== undefined;
            if (!doneList[dep.id] && depIsInArray) {
              // there is a dependency that is not met:
              resolved = false;
              break;
            }
          }
        }
        if (resolved) {
          // All dependencies are met:
          doneList[item.id] = true;
          res.push(item);
        }
      }
    }
    return res;
  }

  trackByRow(index: number, row: { containerName: string, isRetainer: boolean, items: any[] }): string {
    return row.containerName;
  }

}
