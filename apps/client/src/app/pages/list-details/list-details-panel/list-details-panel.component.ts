import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { ListRow } from '../../../modules/list/model/list-row';
import { ZoneBreakdownRow } from '../../../model/common/zone-breakdown-row';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nName } from '../../../model/common/i18n-name';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { ZoneBreakdown } from '../../../model/common/zone-breakdown';
import { TotalPanelPricePopupComponent } from '../total-panel-price-popup/total-panel-price-popup.component';
import { NavigationMapComponent } from '../../../modules/map/navigation-map/navigation-map.component';
import { NavigationObjective } from '../../../modules/map/navigation-objective';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { combineLatest, Observable } from 'rxjs';
import { ItemPickerService } from '../../../modules/item-picker/item-picker.service';
import { filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { LayoutOrderService } from '../../../core/layout/layout-order.service';

@Component({
  selector: 'app-list-details-panel',
  templateUrl: './list-details-panel.component.html',
  styleUrls: ['./list-details-panel.component.less']
})
export class ListDetailsPanelComponent implements OnChanges {

  @Input()
  displayRow: LayoutRowDisplay;

  @Input()
  finalItems = false;

  @Input()
  collapsed = false;

  tiers: ListRow[][];

  zoneBreakdown: ZoneBreakdown;

  hasTrades = false;

  hasNavigationMap = false;

  permissionLevel$: Observable<PermissionLevel>;

  constructor(private i18nTools: I18nToolsService, private l12n: LocalizedDataService,
              private message: NzMessageService, private translate: TranslateService,
              private dialog: NzModalService, private listsFacade: ListsFacade,
              private itemPicker: ItemPickerService, private listManager: ListManagerService,
              private progress: ProgressPopupService, private layoutOrderService: LayoutOrderService) {
    this.permissionLevel$ = this.listsFacade.selectedListPermissionLevel$;
  }

  addItem(): void {
    this.listsFacade.selectedList$.pipe(
      first(),
      switchMap(list => {
        return this.itemPicker.pickItem().pipe(
          filter(item => item !== undefined),
          switchMap((item) => {
            const operation = this.listManager.addToList(+item.itemId, list,
              item.recipe ? item.recipe.recipeId : '', item.amount);
            return this.progress.showProgress(operation, 1);
          })
        );
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progress.showProgress(
          combineLatest(this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key === list.$key && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.displayRow && this.displayRow.tiers) {
      this.generateTiers();
    }
    if (this.displayRow && this.displayRow.zoneBreakdown) {
      this.zoneBreakdown = new ZoneBreakdown(this.displayRow.rows, this.getHideZoneDuplicates());
    }
    this.hasTrades = this.displayRow.rows.reduce((hasTrades, row) => {
      return (row.tradeSources && row.tradeSources.length > 0) || (row.vendors && row.vendors.length > 0) || hasTrades;
    }, false);
    this.hasNavigationMap = this.displayRow.rows.reduce((hasMap, row) => {
      const hasMonstersWithPosition = row.drops && row.drops.some(d => d.position && (d.position.x !== undefined));
      const hasNodesWithPosition = row.gatheredBy && row.gatheredBy.nodes.some(n => n.coords !== undefined && n.coords.length > 0);
      const hasVendorsWithPosition = row.vendors && row.vendors.some(d => d.coords && (d.coords.x !== undefined));
      const hasTradesWithPosition = row.tradeSources && row.tradeSources.some(d => d.npcs.some(npc => npc.coords && npc.coords.x !== undefined));
      return hasMonstersWithPosition || hasNodesWithPosition || hasVendorsWithPosition || hasTradesWithPosition || hasMap;
    }, false);
  }

  private getHideZoneDuplicates(): boolean {
    if (this.displayRow.layoutRow === null) {
      return this.displayRow.layout.recipeHideZoneDuplicates;
    }
    return this.displayRow.layoutRow.hideZoneDuplicates;
  }

  public openNavigationMap(zoneBreakdownRow: ZoneBreakdownRow): void {
    this.dialog.create({
      nzTitle: this.translate.instant(this.displayRow.title),
      nzContent: NavigationMapComponent,
      nzComponentParams: {
        mapId: zoneBreakdownRow.mapId,
        points: <NavigationObjective[]>zoneBreakdownRow.items
          .filter(item => item.done < item.amount)
          .map(item => {
            const partial = this.getPosition(item, zoneBreakdownRow);
            if (partial !== undefined) {
              return <NavigationObjective>{
                x: partial.x,
                y: partial.y,
                name: this.l12n.getItem(item.id),
                iconid: item.icon,
                item_amount: item.amount_needed - item.done,
                type: partial.type
              };
            }
            return undefined;
          })
          .filter(row => row !== undefined)
      },
      nzFooter: null
    });
  }

  private getPosition(row: ListRow, zoneBreakdownRow: ZoneBreakdownRow): Partial<NavigationObjective> {
    if (row.vendors && row.vendors.some(d => d.coords && (d.coords.x !== undefined) && d.zoneId === zoneBreakdownRow.zoneId)) {
      const vendor = row.vendors.find(d => d.coords && (d.coords.x !== undefined) && d.zoneId === zoneBreakdownRow.zoneId);
      return {
        x: vendor.coords.x,
        y: vendor.coords.y,
        type: 'Vendor'
      };
    }
    if (row.tradeSources && row.tradeSources.some(d => d.npcs.some(npc => npc.coords && npc.coords.x !== undefined && npc.zoneId === zoneBreakdownRow.zoneId))) {
      const trade = row.tradeSources.find(d => d.npcs.some(n => n.coords && n.coords.x !== undefined && n.zoneId === zoneBreakdownRow.zoneId));
      const npc = trade.npcs.find(n => n.coords && n.coords.x !== undefined && n.zoneId === zoneBreakdownRow.zoneId);
      return {
        x: npc.coords.x,
        y: npc.coords.y,
        type: 'Trade'
      };
    }
    if (row.gatheredBy && row.gatheredBy.nodes.some(n => n.coords !== undefined && n.coords.length > 0 && n.zoneid === zoneBreakdownRow.zoneId)) {
      const node = row.gatheredBy.nodes.find(n => n.coords !== undefined && n.coords.length > 0 && n.zoneid === zoneBreakdownRow.zoneId);
      return {
        x: node.coords[0],
        y: node.coords[1],
        type: 'Gathering'
      };
    }
    if (row.drops && row.drops.some(d => d.position && (d.position.x !== undefined) && d.position.zoneid === zoneBreakdownRow.zoneId)) {
      const drop = row.drops.find(d => d.position && (d.position.x !== undefined) && d.position.zoneid === zoneBreakdownRow.zoneId);
      return {
        x: drop.position.x,
        y: drop.position.y,
        type: 'Hunting'
      };
    }
  }

  public generateTiers(): void {
    if (this.displayRow.rows !== null) {
      this.tiers = [[]];
      this.topologicalSort(this.displayRow.rows).forEach(row => {
        this.tiers = this.setTier(row, this.tiers);
      });
    }
    this.tiers = this.tiers.map(tier => {
      return this.layoutOrderService.order(tier, this.displayRow.layoutRow.orderBy, this.displayRow.layoutRow.order);
    })
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

  private setTier(row: ListRow, result: ListRow[][]): ListRow[][] {
    if (result[0] === undefined) {
      result[0] = [];
    }
    // Default tier is -1, because we want to do +1 to the last requirement tier to define the tier of the current item.
    let requirementsTier = -1;
    for (const requirement of (row.requires || [])) {
      for (let tier = 0; tier < result.length; tier++) {
        if (result[tier].find(r => r.id === requirement.id) !== undefined) {
          requirementsTier = requirementsTier > tier ? requirementsTier : tier;
        }
      }
    }
    const itemTier = requirementsTier + 1;
    if (result[itemTier] === undefined) {
      result[itemTier] = [];
    }
    result[itemTier].push(row);
    return result;
  }

  public getLocation(id: number): I18nName {
    if (id === -1) {
      return { fr: 'Autre', de: 'Anderes', ja: 'Other', en: 'Other', zh: '其他', ko: '기타' };
    }
    return this.l12n.getPlace(id);
  }

  public openTotalPricePopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST.Total_price'),
      nzContent: TotalPanelPricePopupComponent,
      nzComponentParams: {
        panelContent: this.displayRow.rows
      },
      nzFooter: null
    });
  }

  public getTextExport(): string {
    return this.displayRow.rows.reduce((exportString, row) => {
      return exportString + `${row.amount}x ${this.i18nTools.getName(this.l12n.getItem(row.id))}\n`;
    }, `${this.displayRow.title} :\n`);
  }

  textCopied(): void {
    this.message.success(this.translate.instant('LIST.Copied_as_text'));
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

  trackByTier(index: number, item: ListRow[]) {
    return item.length;
  }

  trackByZone(index: number, item: ZoneBreakdownRow) {
    return item.zoneId;
  }

}
