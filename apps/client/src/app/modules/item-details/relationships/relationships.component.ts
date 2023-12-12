import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ListRow } from '../../list/model/list-row';
import { List } from '../../list/model/list';
import { ListsFacade } from '../../list/+state/lists.facade';
import { PlatformService } from '../../../core/tools/platform.service';
import { InventoryService } from '../../inventory/inventory.service';
import { ListController } from '../../list/list-controller';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { CeilPipe } from '../../../pipes/pipes/ceil.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { InventoryPositionComponent } from '../../inventory/inventory-position/inventory-position.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-relationships',
    templateUrl: './relationships.component.html',
    styleUrls: ['./relationships.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, NgFor, ItemIconComponent, I18nNameComponent, NzTagModule, NzToolTipModule, InventoryPositionComponent, NzButtonModule, NzWaveModule, NzIconModule, NzListModule, AsyncPipe, I18nPipe, TranslateModule, ItemNamePipe, CeilPipe, XivapiIconPipe]
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
    this.list$ = this.list$ || this.listsFacade.selectedList$;
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
        ListController.forEach(list, item => {
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
    this.listsFacade.setItemDone({
      itemId: item.id,
      itemIcon: item.icon,
      finalItem: this.finalItem,
      delta: +amount,
      recipeId: item.recipeId,
      totalNeeded: item.amount
    });
  }

  public trackByInventoryEntry(index: number, entry: { containerName: string, amount: number, hq: boolean }): string {
    return `${entry.containerName}${entry.hq}`;
  }

}
