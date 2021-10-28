import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ListRow } from '../../list/model/list-row';
import { List } from '../../list/model/list';
import { ListsFacade } from '../../list/+state/lists.facade';
import { PlatformService } from '../../../core/tools/platform.service';
import { InventoryService } from '../../inventory/inventory.service';
import { ListController } from '../../list/list-controller';

@Component({
  selector: 'app-relationships',
  templateUrl: './relationships.component.html',
  styleUrls: ['./relationships.component.less']
})
export class RelationshipsComponent implements OnInit {

  public item: ListRow;

  public list$: Observable<List>;

  public requires$: Observable<ListRow[]>;

  public requiredBy$: Observable<ListRow[]>;

  public finalItem = false;

  public markedAsDone: { [index: number]: boolean } = {};

  constructor(private listsFacade: ListsFacade, private inventoryService: InventoryService,
              private platform: PlatformService) {
    this.list$ = this.listsFacade.selectedList$;
  }

  ngOnInit() {
    this.requires$ = this.list$.pipe(
      switchMap(list => {
        const items$ = (this.item.requires || [])
          .sort((a, b) => a.id < b.id ? -1 : 1)
          .map(req => {
            let item: any = ListController.getItemById(list, req.id, true);
            item = { ...item, reqAmount: req.amount, canBeCrafted: ListController.canBeCrafted(list, item) };
            if (this.platform.isDesktop()) {
              return this.inventoryService.inventory$.pipe(
                map(inventory => {
                  return inventory.getItem(item.id).map(entry => {
                    return {
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
                }),
                map(entries => {
                  item.inventoryEntries = entries;
                  return item;
                })
              );
            } else {
              return of(item);
            }
          });
        return combineLatest(items$);
      })
    );

    this.requiredBy$ = this.list$.pipe(
      map(list => {
        const requiredBy = [];
        ListController.forEach(list,item => {
          if (item.requires !== undefined) {
            item.requires.forEach(req => {
              if (req.id === this.item.id) {
                requiredBy.push({ ...item, canBeCrafted: ListController.canBeCrafted(list, item) });
              }
            });
          }
        });
        return requiredBy;
      })
    );
  }

  markAsDone(item: ListRow, amount: number): void {
    this.markedAsDone[item.id] = true;
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, +amount, item.recipeId, item.amount);
  }

  public trackByInventoryEntry(index: number, entry: { containerName: string, amount: number, hq: boolean }): string {
    return `${entry.containerName}${entry.hq}`;
  }

}
