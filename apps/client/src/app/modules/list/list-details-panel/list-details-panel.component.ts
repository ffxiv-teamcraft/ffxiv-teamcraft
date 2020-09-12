import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { ClipboardService } from 'ngx-clipboard';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { filter, first, map, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ListsFacade } from '../+state/lists.facade';
import { AuthFacade } from '../../../+state/auth.facade';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { UniversalisService } from '../../../core/api/universalis.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { LayoutOrderService } from '../../../core/layout/layout-order.service';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { I18nName } from '../../../model/common/i18n-name';
import { ZoneBreakdown } from '../../../model/common/zone-breakdown';
import { ZoneBreakdownRow } from '../../../model/common/zone-breakdown-row';
import {
  TotalPanelPricePopupComponent,
} from '../../../pages/list-details/total-panel-price-popup/total-panel-price-popup.component';
import { EorzeaFacade } from '../../eorzea/+state/eorzea.facade';
import { ItemPickerService } from '../../item-picker/item-picker.service';
import { NavigationMapComponent } from '../../map/navigation-map/navigation-map.component';
import { NavigationObjective } from '../../map/navigation-objective';
import { WorldNavigationMapComponent } from '../../map/world-navigation-map/world-navigation-map.component';
import { ProgressPopupService } from '../../progress-popup/progress-popup.service';
import { SettingsService } from '../../settings/settings.service';
import { DataType } from '../data/data-type';
import { ListRowSerializationHelper } from '../data/ListRowSerializationHelper';
import { ListManagerService } from '../list-manager.service';
import { Drop } from '../model/drop';
import { ListRow } from '../model/list-row';
import { Alarm } from '../../../core/alarms/alarm';
import { GatheredBy } from '../model/gathered-by';
import { TradeSource } from '../model/trade-source';
import { Vendor } from '../model/vendor';

@Component({
  selector: 'app-list-details-panel',
  templateUrl: './list-details-panel.component.html',
  styleUrls: ['./list-details-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDetailsPanelComponent implements OnChanges, OnInit {

  private _displayRow: LayoutRowDisplay;

  @Input()
  public set displayRow(row: LayoutRowDisplay) {
    this.progression = this.listsFacade.buildProgression(row.rows);
    this._displayRow = row;
  }

  public get displayRow(): LayoutRowDisplay {
    return this._displayRow;
  }

  public get noScroll(): boolean {
    switch (this.settings.listScrollingMode) {
      case 'default':
        return false;
      case 'large':
        return !this.largeList;
      case 'never':
        return true;
    }
  }

  @Input()
  finalItems = false;

  @Input()
  collapsed = false;

  @Input()
  overlay = false;

  @Input()
  largeList = false;

  progression: number;

  tiers: ListRow[][];

  zoneBreakdown: ZoneBreakdown;

  hasTrades = false;

  hasNavigationMap = false;

  hasNavigationMapForZone: { [index: number]: boolean } = {};

  permissionLevel$: Observable<PermissionLevel> = this.listsFacade.selectedListPermissionLevel$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  currentZoneId$: Observable<number> = this.eorzeaFacade.zoneId$;

  hasAlreadyBeenOpened: boolean;

  server$ = this.authFacade.mainCharacter$.pipe(
    map(char => char.Server)
  )
  private serializationHelper = new ListRowSerializationHelper(this.i18nTools, this.l12n, this.gt);

  constructor(private i18nTools: I18nToolsService, private l12n: LocalizedDataService,
    private message: NzMessageService, private translate: TranslateService,
    private dialog: NzModalService, private listsFacade: ListsFacade,
    private itemPicker: ItemPickerService, private listManager: ListManagerService,
    private progress: ProgressPopupService, private layoutOrderService: LayoutOrderService,
    private eorzeaFacade: EorzeaFacade, private alarmsFacade: AlarmsFacade,
    public settings: SettingsService, private lazyData: LazyDataService,
    private authFacade: AuthFacade,
    private gt: GarlandToolsService,
    private _clipboardService: ClipboardService
  ) {
  }

  addItems(): void {
    this.listsFacade.selectedList$.pipe(
      first(),
      switchMap(list => {
        return this.itemPicker.pickItems().pipe(
          filter(items => items.length > 0),
          switchMap((items) => {
            const operations = items.map(item => {
              return this.listManager.addToList(+item.itemId, list,
                item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts);
            });
            let operation$: Observable<any>;
            if (operations.length > 0) {
              operation$ = concat(
                ...operations
              );
            } else {
              operation$ = of(list);
            }
            return this.progress.showProgress(operation$,
              items.length,
              'Adding_recipes',
              { amount: items.length, listname: list.name });
          })
        );
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progress.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt.toMillis() === list.createdAt.toMillis() && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe();
  }


  public activeChange(event: boolean): void {
    if (event) {
      this.hasAlreadyBeenOpened = true;
    }
    this.collapsed = !event;
  }

  ngOnInit(): void {
    if (this.displayRow && this.displayRow.collapsedByDefault) {
      this.collapsed = true;
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (!this.displayRow) {
      return;
    }
    if (this.displayRow && (this.displayRow.tiers || this.displayRow.reverseTiers)) {
      this.generateTiers(this.displayRow.reverseTiers);
    }
    if (this.displayRow && this.displayRow.zoneBreakdown) {
      this.zoneBreakdown = new ZoneBreakdown(this.displayRow.rows, this.displayRow.filterChain, this.getHideZoneDuplicates(), this.finalItems);
      this.hasNavigationMapForZone = this.zoneBreakdown.rows.reduce((res, zbRow) => {
        return {
          ...res,
          [zbRow.zoneId]: this.hasPositionsInRows(zbRow.items, zbRow.zoneId)
        };
      }, {});
      this.hasNavigationMap = this.getZoneBreakdownPathRows(this.zoneBreakdown).length > 0;
    }
    this.hasTrades = this.displayRow.rows.reduce((hasTrades, row) => {
      return ListRowSerializationHelper.getData(row, DataType.TRADE_SOURCES).length > 0
        || ListRowSerializationHelper.getData(row, DataType.VENDORS).length > 0
        || hasTrades;
    }, false);
    this.hasNavigationMap = this.hasPositionsInRows(this.displayRow.rows);
  }

  private hasPositionsInRows(rows: ListRow[], zoneId?: number): boolean {
    return rows.reduce((hasMap, row) => {
      const hasMonstersWithPosition = ListRowSerializationHelper.getData<Drop[]>(row, DataType.DROPS)
        .some(d => {
          return d.position
            && (d.position.x !== undefined)
            && !this.lazyData.data.maps[d.mapid].dungeon
            && (!zoneId || d.zoneid === zoneId);
        });
      const hasNodesWithPosition = (ListRowSerializationHelper.getData(row, DataType.GATHERED_BY, true).nodes || [])
        .some((n: { coords: string | any[]; zoneid: number; }) =>
          n.coords !== undefined && n.coords.length > 0 && (!zoneId || n.zoneid === zoneId)
        );
      const hasVendorsWithPosition = ListRowSerializationHelper.getData(row, DataType.VENDORS)
        .some((d: { coords: { x: any; }; zoneId: number; }) =>
          d.coords && (d.coords.x !== undefined) && (!zoneId || d.zoneId === zoneId)
        );
      const hasTradesWithPosition = ListRowSerializationHelper.getData(row, DataType.TRADE_SOURCES)
        .some((d: { npcs: any[]; zoneId: number; }) =>
          d.npcs.some(npc => npc.coords && npc.coords.x !== undefined && (!zoneId || d.zoneId === zoneId))
        );
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
                itemId: item.id,
                total_item_amount: item.amount,
                item_amount: item.amount_needed - item.done,
                type: partial.type,
                gatheringType: partial.gatheringType
              };
            }
            return undefined;
          })
          .filter(row => row !== undefined)
      },
      nzFooter: null
    });
  }

  public getZoneBreakdownPathRows(zoneBreakdown: ZoneBreakdown): NavigationObjective[] {
    return <NavigationObjective[]>[].concat
      .apply([],
        zoneBreakdown.rows.map(zoneBreakdownRow => {
          return zoneBreakdownRow.items.filter(item => item.done < item.amount)
            .map(item => {
              const partial = this.getPosition(item, zoneBreakdownRow);
              if (partial !== undefined) {
                return <NavigationObjective>{
                  mapId: zoneBreakdownRow.mapId,
                  x: partial.x,
                  y: partial.y,
                  name: this.l12n.getItem(item.id),
                  iconid: item.icon,
                  itemId: item.id,
                  total_item_amount: item.amount,
                  item_amount: item.amount_needed - item.done,
                  type: partial.type,
                  gatheringType: partial.gatheringType
                };
              }
              return undefined;
            })
            .filter(row => row !== undefined);
        })
      );
  }

  public openFullPathPopup(zoneBreakdown: ZoneBreakdown): void {
    const ref = this.dialog.create({
      nzTitle: this.translate.instant('LIST.Optimized_full_path'),
      nzContent: WorldNavigationMapComponent,
      nzComponentParams: {
        points: this.getZoneBreakdownPathRows(zoneBreakdown)
      },
      nzFooter: null
    });
    ref.afterOpen.pipe(
      switchMap(() => {
        return ref.getContentComponent().markAsDone$;
      }),
      takeUntil(ref.afterClose)
    ).subscribe(step => {
      this.listsFacade.setItemDone(step.itemId, step.iconid, false, step.item_amount, null, step.total_item_amount);
    });
  }

  private getPosition(row: ListRow, zoneBreakdownRow: ZoneBreakdownRow): Partial<NavigationObjective> {
    const vendors = this.getData<Vendor[]>(row, DataType.VENDORS);
    const tradeSources = this.getData<TradeSource[]>(row, DataType.TRADE_SOURCES);
    const gatheredBy = this.getData<GatheredBy>(row, DataType.GATHERED_BY);
    const drops = this.getData<Drop[]>(row, DataType.DROPS);
    const alarms = this.getData<Alarm[]>(row, DataType.ALARMS);
    const positions = [];
    if (vendors.some(d => d.coords && (d.coords.x !== undefined) && d.zoneId === zoneBreakdownRow.zoneId)) {
      const vendor = vendors.find(d => d.coords && (d.coords.x !== undefined) && d.zoneId === zoneBreakdownRow.zoneId);
      positions.push({
        x: vendor.coords.x,
        y: vendor.coords.y,
        type: 'Vendor'
      });
    }
    if (tradeSources.some(d => d.npcs.some(npc => npc.coords && npc.coords.x !== undefined && npc.zoneId === zoneBreakdownRow.zoneId))) {
      const trade = tradeSources.find(d => d.npcs.some(n => n.coords && n.coords.x !== undefined && n.zoneId === zoneBreakdownRow.zoneId));
      const npc = trade.npcs.find(n => n.coords && n.coords.x !== undefined && n.zoneId === zoneBreakdownRow.zoneId);
      positions.push({
        x: npc.coords.x,
        y: npc.coords.y,
        type: 'Trade'
      });
    }
    if ((gatheredBy.nodes || []).some(n => n.coords !== undefined && n.coords.length > 0 && n.zoneid === zoneBreakdownRow.zoneId)) {
      const node = gatheredBy.nodes.find(n => n.coords !== undefined && n.coords.length > 0 && n.zoneid === zoneBreakdownRow.zoneId);
      positions.push({
        x: node.coords[0],
        y: node.coords[1],
        type: 'Gathering',
        gatheringType: node.type
      });
    }
    if (drops.some(d => d.position && (d.position.x !== undefined) && d.position.zoneid === zoneBreakdownRow.zoneId)) {
      const drop = drops.find(d => d.position && (d.position.x !== undefined) && d.position.zoneid === zoneBreakdownRow.zoneId);
      positions.push({
        x: drop.position.x,
        y: drop.position.y,
        type: 'Hunting'
      });
    }
    if (alarms.some(a => a.coords && a.coords.x && a.zoneId === zoneBreakdownRow.zoneId)) {
      const alarm = alarms.find(a => a.coords && a.coords.x && a.zoneId === zoneBreakdownRow.zoneId);
      positions.push({
        x: alarm.coords.x,
        y: alarm.coords.y,
        type: 'Gathering',
        gatheringType: alarm.type
      });
    }
    const isGathering = this.displayRow.filterChain.indexOf('IS_GATHERING') > -1;
    const isVendor = this.displayRow.filterChain.indexOf('CAN_BE_BOUGHT') > -1;
    const isTrade = this.displayRow.filterChain.indexOf('TRADE') > -1;
    const isHunting = this.displayRow.filterChain.indexOf('_DROP') > -1;
    const preferredPosition = positions.find(p => {
      if (isGathering) {
        return p.type === 'Gathering';
      }
      if (isVendor) {
        return p.type === 'Vendor';
      }
      if (isTrade) {
        return p.type === 'Trade';
      }
      if (isHunting) {
        return p.type === 'Hunting';
      }
      return true;
    });
    return preferredPosition || positions[0];
  }

  public generateTiers(reverse = false): void {
    if (this.displayRow.rows !== null) {
      this.tiers = [[]];
      this.topologicalSort(this.displayRow.rows).forEach(row => {
        this.tiers = this.setTier(row, this.tiers);
      });
    }
    this.tiers = this.tiers.map(tier => {
      return this.layoutOrderService.order(tier, this.displayRow.layoutRow.orderBy, this.displayRow.layoutRow.order);
    });
    if (reverse) {
      this.tiers = this.tiers.reverse();
    }
  }

  public markPanelAsDone(): void {
    this.displayRow.rows.forEach(row => {
      this.listsFacade.setItemDone(row.id, row.icon, this.finalItems, row.amount - row.done, row.recipeId, row.amount, false);
    });
  }

  public resetPanel(): void {
    this.displayRow.rows.forEach(row => {
      this.listsFacade.setItemDone(row.id, row.icon, this.finalItems, -row.done, row.recipeId, row.amount, false);
    });
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

  public copyTextExport() {
    if (this._clipboardService.copyFromContent(this.getTextExport()))
      this.textCopied();
  }

  public getTextExport(): string {
    let rows: ListRow[];
    if (this.tiers) {
      rows = this.tiers.reduce((res, tier) => {
        return [...res, ...tier];
      }, []);
    } else {
      rows = this.displayRow.rows;
    }
    return rows.reduce((exportString, row) => {
      return exportString + `${row.amount}x ${this.i18nTools.getName(this.l12n.getItem(row.id))}\n`;
    }, `${this.displayRow.title} :\n`);
  }

  textCopied(): void {
    this.message.success(this.translate.instant('LIST.Copied_as_text'));
  }

  // Done to reduce render-time perf of generating the whole string into the DOM. If there's a way to do it with [cdk directive](https://material.angular.io/cdk/clipboard/overview) that would be ideal
  public copyJSONExport(serverName: string) {
    let rows: ListRow[];
    if (this.tiers) {
      rows = this.tiers.reduce((res, tier) => {
        return [...res, ...tier];
      }, []);
    } else {
      rows = this.displayRow.rows;
    };

    if (this._clipboardService.copyFromContent(
      JSON.stringify(this.getSerializedRowData(serverName, rows))//,null,2)
    ))
      this.jsonCopied();
  }

  private getSerializedRowData(serverName: string, rows: ListRow[]): any {
    return this.serializationHelper.getJsonExport(UniversalisService.GetDCFromServerName(this.lazyData.datacenters, serverName), serverName, rows, undefined);
  }

  jsonCopied(): void {
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
