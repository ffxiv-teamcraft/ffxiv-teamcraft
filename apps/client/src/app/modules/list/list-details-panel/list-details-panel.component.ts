import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { ListRow } from '../model/list-row';
import { ZoneBreakdownRow } from '../../../model/common/zone-breakdown-row';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ZoneBreakdown } from '../../../model/common/zone-breakdown';
import { TotalPanelPricePopupComponent } from '../../../pages/list-details/total-panel-price-popup/total-panel-price-popup.component';
import { NavigationMapComponent } from '../../map/navigation-map/navigation-map.component';
import { NavigationObjective } from '../../map/navigation-objective';
import { ListsFacade } from '../+state/lists.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { combineLatest, merge, Observable, of, ReplaySubject } from 'rxjs';
import { debounceTime, filter, first, map, switchMap, takeUntil } from 'rxjs/operators';
import { LayoutOrderService } from '../../../core/layout/layout-order.service';
import { WorldNavigationMapComponent } from '../../map/world-navigation-map/world-navigation-map.component';
import { EorzeaFacade } from '../../eorzea/+state/eorzea.facade';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { DataType, getItemSource } from '@ffxiv-teamcraft/types';
import { SettingsService } from '../../settings/settings.service';
import { Drop } from '../model/drop';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { TradeSource } from '../model/trade-source';
import { Vendor } from '../model/vendor';
import { LayoutRowDisplayMode } from '../../../core/layout/layout-row-display-mode';
import { NpcBreakdown } from '../../../model/common/npc-breakdown';
import { NpcBreakdownRow } from '../../../model/common/npc-breakdown-row';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { observeInput } from '../../../core/rxjs/observe-input';
import { AuthFacade } from '../../../+state/auth.facade';
import { ProcessedListAggregate } from '../../list-aggregate/model/processed-list-aggregate';
import { getTiers } from '../../../core/tools/get-tiers';
import { LayoutRowFilter } from '../../../core/layout/layout-row-filter';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { MapPositionComponent } from '../../map/map-position/map-position.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CompactItemRowComponent } from '../item/compact-item-row/compact-item-row.component';
import { NgForTrackByIdDirective } from '../../../core/track-by/ng-for-track-by-id.directive';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { AggregateItemRowComponent } from '../item/aggregate-item-row/aggregate-item-row.component';
import { ItemRowComponent } from '../item/item-row/item-row.component';
import { LazyScrollComponent } from '../../lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NgIf, NgFor, NgTemplateOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-list-details-panel',
    templateUrl: './list-details-panel.component.html',
    styleUrls: ['./list-details-panel.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzCollapseModule, LazyScrollComponent, ItemRowComponent, AggregateItemRowComponent, NzGridModule, NgFor, NgForTrackByIdDirective, CompactItemRowComponent, NzDividerModule, NgTemplateOutlet, NgSwitch, NgSwitchCase, FlexModule, NzButtonModule, NzIconModule, NzToolTipModule, NzWaveModule, MapPositionComponent, NgSwitchDefault, NzProgressModule, NzPopconfirmModule, ClipboardDirective, NzSpinModule, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule]
})
export class ListDetailsPanelComponent implements OnChanges, OnInit {

  public LayoutRowDisplayMode = LayoutRowDisplayMode;

  @Input()
  displayRow: LayoutRowDisplay;

  @Input()
  compact: boolean;

  @Input()
  finalItems = false;

  @Input()
  overlay = false;

  @Input()
  largeList = false;

  @Input()
  aggregate: ProcessedListAggregate;

  private _forcePermissionLevel$ = new ReplaySubject<PermissionLevel>();

  @Input()
  set permissionLevel(level: PermissionLevel) {
    this._forcePermissionLevel$.next(level);
  }

  collapsed = false;

  zoneBreakdown: ZoneBreakdown;

  hasTrades = false;

  hasNavigationMap = false;

  hasNavigationMapForZone: { [index: number]: boolean } = {};

  permissionLevel$: Observable<PermissionLevel> = merge(
    this.listsFacade.selectedListPermissionLevel$,
    this._forcePermissionLevel$
  );

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  currentZoneId$: Observable<number> = this.eorzeaFacade.zoneId$;

  hasAlreadyBeenOpened: boolean;

  private displayRow$ = observeInput(this, 'displayRow');

  progression$: Observable<{ progress: number }> = this.displayRow$.pipe(
    map(displayRow => {
      return {
        progress: this.listsFacade.buildProgression(displayRow.rows)
      };
    })
  );

  tiers$: Observable<ListRow[][]> = this.displayRow$.pipe(
    filter(row => row.tiers || row.reverseTiers),
    switchMap(displayRow => {
      const tiers = getTiers(displayRow.rows);
      return safeCombineLatest(tiers.map(tier => {
        return this.layoutOrderService.order(tier, displayRow.layoutRow.orderBy, displayRow.layoutRow.order);
      })).pipe(
        map(orderedTiers => {
          if (displayRow.reverseTiers) {
            return orderedTiers.reverse();
          }
          return orderedTiers;
        })
      );
    })
  );

  canSkip$: Observable<Record<number, number>> = this.displayRow$.pipe(
    map(({ rows, filterChain }) => {
      if (!filterChain.includes(LayoutRowFilter.IS_CRAFT.name) && !this.finalItems) {
        return rows
          .filter(row => !row.finalItem)
          .reduce((registry, row) => {
            return {
              ...registry,
              [row.id]: rows
                .filter(row => !row.finalItem)
                .reduce((acc, r) => {
                  const requirement = (r.requires || []).find(req => +req.id === +row.id);
                  if (requirement) {
                    return acc + requirement.amount * ((r.amount_needed || r.amount) - r.done);
                  }
                  return Math.max(acc, 0);
                }, 0)
            };
          }, {});
      }
      return {};
    })
  );

  npcBreakdown$: Observable<NpcBreakdown> = combineLatest([this.displayRow$, this.canSkip$]).pipe(
    debounceTime(10),
    map(([displayRow, canSkip]) => new NpcBreakdown(displayRow.rows, this.lazyData, this.settings.hasAccessToHousingVendors, canSkip))
  );

  constructor(private i18n: I18nToolsService, public translate: TranslateService,
              private dialog: NzModalService, private listsFacade: ListsFacade,
              private layoutOrderService: LayoutOrderService,
              private eorzeaFacade: EorzeaFacade, private alarmsFacade: AlarmsFacade,
              public settings: SettingsService, private lazyData: LazyDataFacade,
              private cd: ChangeDetectorRef, private authFacade: AuthFacade) {
  }

  public get displayMode(): LayoutRowDisplayMode {
    if (this.displayRow.zoneBreakdown) {
      return LayoutRowDisplayMode.ZONE_BREAKDOWN;
    }
    if (this.displayRow.tiers) {
      return LayoutRowDisplayMode.TIERS;
    }
    if (this.displayRow.reverseTiers) {
      return LayoutRowDisplayMode.REVERSE_TIERS;
    }
    if (this.displayRow.npcBreakdown) {
      return LayoutRowDisplayMode.NPC_BREAKDOWN;
    }
    return LayoutRowDisplayMode.DEFAULT;
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

  addItems(): void {
    this.listsFacade.selectedList$.pipe(
      first(),
      switchMap(list => {
        return this.listsFacade.addItems(list);
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
    } else if (this.displayRow && this.displayRow.rows.length > 25) {
      this.collapsed = true;
    }
  }

  ngOnChanges(): void {
    if (!this.displayRow) {
      return;
    }
    if (this.displayRow.zoneBreakdown) {
      this.zoneBreakdown = new ZoneBreakdown(this.displayRow.rows, this.displayRow.filterChain, this.getHideZoneDuplicates(), this.finalItems);
      safeCombineLatest(this.zoneBreakdown.rows
        .map(row => {
          return this.hasPositionsInRows(row.items, row.zoneId).pipe(
            map(hasPositions => ({ row, hasPositions }))
          );
        })
      ).subscribe(registry => {
        this.hasNavigationMapForZone = registry
          .reduce((res, { row, hasPositions }) => {
            return {
              ...res,
              [row.zoneId]: hasPositions
            };
          }, {});
        this.cd.detectChanges();
      });
      this.hasNavigationMap = this.getZoneBreakdownPathRows(this.zoneBreakdown).length > 0;
    }
    if (this.displayRow.npcBreakdown) {
      setTimeout(() => {
        this.cd.detectChanges();
      });
    }
    this.hasTrades = this.displayRow.rows.reduce((hasTrades, row) => {
      return (getItemSource(row, DataType.TRADE_SOURCES).length > 0) || (getItemSource(row, DataType.VENDORS).length > 0) || hasTrades;
    }, false);
    this.cd.detectChanges();
    this.hasPositionsInRows(this.displayRow.rows).pipe(
      first()
    ).subscribe(hasPositions => {
      this.hasNavigationMap = hasPositions;
      this.cd.detectChanges();
    });
  }

  public openZoneBreakdownRowNavigationMap(zoneBreakdownRow: ZoneBreakdownRow): void {
    this.dialog.create({
      nzTitle: this.translate.instant(this.displayRow.title),
      nzContent: NavigationMapComponent,
      nzData: {
        mapId: zoneBreakdownRow.mapId,
        points: <NavigationObjective[]>zoneBreakdownRow.items
          .filter(item => item.done < item.amount)
          .map(item => {
            const partial = this.getPosition(item, zoneBreakdownRow);
            if (partial !== undefined) {
              return <NavigationObjective>{
                x: partial.x,
                y: partial.y,
                name: this.i18n.getNameObservable('items', item.id),
                iconid: item.icon,
                itemId: item.id,
                total_item_amount: item.amount,
                item_amount: item.amount_needed - item.done,
                type: partial.type,
                gatheringType: partial.gatheringType,
                monster: partial.monster,
                fnalItem: this.finalItems || item.finalItem || false
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
                  name: this.i18n.getNameObservable('items', item.id),
                  itemId: item.id,
                  total_item_amount: item.amount,
                  item_amount: item.amount_needed - item.done,
                  type: partial.type,
                  gatheringType: partial.gatheringType,
                  monster: partial.monster,
                  fnalItem: this.finalItems || item.finalItem || false
                };
              }
              return undefined;
            })
            .filter(r => r !== undefined);
        })
      );
  }

  public openFullPathPopup(zoneBreakdown: ZoneBreakdown): void {
    const ref = this.dialog.create({
      nzTitle: this.translate.instant('LIST.Optimized_full_path'),
      nzContent: WorldNavigationMapComponent,
      nzData: {
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
      this.listsFacade.setItemDone({
        itemId: step.itemId,
        itemIcon: step.iconid,
        finalItem: step.finalItem,
        delta: step.item_amount,
        recipeId: null,
        totalNeeded: step.total_item_amount
      });
    });
  }

  public markPanelAsDone(): void {
    this.displayRow.rows.forEach(row => {
      if (this.aggregate) {
        this.aggregate.generateSetItemDone(row, row.amount - row.done, this.finalItems || row.finalItem)(this.listsFacade);
      } else {
        this.listsFacade.setItemDone({
          itemId: row.id,
          itemIcon: row.icon,
          finalItem: this.finalItems || row.finalItem,
          delta: row.amount - row.done,
          recipeId: row.recipeId,
          totalNeeded: row.amount,
          external: false
        });
      }
      if (this.settings.autoMarkAsCompleted) {
        if (row.sources.some(s => s.type === DataType.GATHERED_BY)) {
          this.authFacade.markAsDoneInLog('gathering', row.id, true);
        }
        if (row.sources.some(s => s.type === DataType.CRAFTED_BY)) {
          this.authFacade.markAsDoneInLog('crafting', +row.recipeId, true);
        }
      }
    });
  }

  public markPanelAsHQ(hq: boolean): void {
    this.listsFacade.markAsHq(this.displayRow.rows.map(row => row.id), hq, this.finalItems);
  }

  public resetPanel(): void {
    this.displayRow.rows.forEach(row => {
      if (this.aggregate) {
        this.aggregate.generateSetItemDone(row, -row.done, this.finalItems || row.finalItem)(this.listsFacade);
      } else {
        this.listsFacade.setItemDone({
          itemId: row.id,
          itemIcon: row.icon,
          finalItem: this.finalItems || row.finalItem,
          delta: -row.done,
          recipeId: row.recipeId,
          totalNeeded: row.amount,
          external: false
        });
      }
    });
  }

  public getLocation(id: number): Observable<string> {
    if (id === -1) {
      return of({ fr: 'Autre', de: 'Anderes', ja: 'Other', en: 'Other', zh: '其他', ko: '기타' }).pipe(
        map(i18nName => this.i18n.getName(i18nName))
      );
    }
    return this.i18n.getMapName(id);
  }

  public getNpc(id: number): Observable<string> {
    if (id === -1) {
      return of({ fr: 'Autre', de: 'Anderes', ja: 'Other', en: 'Other', zh: '其他', ko: '기타' }).pipe(
        map(i18nName => this.i18n.getName(i18nName))
      );
    }
    return this.i18n.getNameObservable('npcs', id);
  }

  public openTotalPricePopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST.Total_price'),
      nzContent: TotalPanelPricePopupComponent,
      nzData: {
        panelContent: this.displayRow.rows
      },
      nzFooter: null
    });
  }

  public getTextExport = (...tiers: ListRow[][]) => {
    let rows: ListRow[];
    if (tiers.length > 0 && (this.displayRow.tiers || this.displayRow.reverseTiers)) {
      rows = tiers.flat();
    } else {
      rows = this.displayRow.rows;
    }
    return safeCombineLatest(rows.map(row => {
      return this.i18n.getNameObservable('items', row.id).pipe(
        map(itemName => ({ row, itemName }))
      );
    })).pipe(
      map(rowsWithNames => {
        return rowsWithNames.reduce((exportString, { row, itemName }) => {
          return exportString + `${row.amount}x ${itemName}\n`;
        }, `${this.translate.instant(this.displayRow.title)} :\n`);
      }),
      first()
    );
  };

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

  trackByTier(index: number) {
    return true;
  }

  trackByZone(index: number, item: ZoneBreakdownRow) {
    return item.zoneId;
  }

  trackByNpc(index: number, item: NpcBreakdownRow) {
    return item.npcId;
  }

  private hasPositionsInRows(rows: ListRow[], zoneId?: number): Observable<boolean> {
    return this.lazyData.getEntry('maps')
      .pipe(
        map(maps => {
          return rows.reduce((hasMap, row) => {
            const hasMonstersWithPosition = getItemSource<Drop[]>(row, DataType.DROPS).some(d => {
              return d.position
                && (d.position.x !== undefined)
                && !maps[d.mapid].dungeon
                && (!zoneId || d.zoneid === zoneId);
            });
            const hasNodesWithPosition = (getItemSource(row, DataType.GATHERED_BY, true).nodes || []).some(n => n.x !== undefined && (!zoneId || n.zoneId === zoneId));
            const hasVendorsWithPosition = getItemSource(row, DataType.VENDORS).some(d => d.coords && (d.coords.x !== undefined) && (!zoneId || d.zoneId === zoneId));
            const hasTradesWithPosition = getItemSource(row, DataType.TRADE_SOURCES).some(d => d.npcs.some(npc => npc.coords && npc.coords.x !== undefined && (!zoneId || npc.zoneId === zoneId)));
            return hasMonstersWithPosition || hasNodesWithPosition || hasVendorsWithPosition || hasTradesWithPosition || hasMap;
          }, false);
        })
      );
  }

  private getHideZoneDuplicates(): boolean {
    if (this.displayRow.layoutRow === null) {
      return this.displayRow.layout.recipeHideZoneDuplicates;
    }
    return this.displayRow.layoutRow.hideZoneDuplicates;
  }

  private getPosition(row: ListRow, zoneBreakdownRow: ZoneBreakdownRow): Partial<NavigationObjective> {
    const vendors = getItemSource<Vendor[]>(row, DataType.VENDORS);
    const tradeSources = getItemSource<TradeSource[]>(row, DataType.TRADE_SOURCES);
    const gatheredBy = getItemSource(row, DataType.GATHERED_BY);
    const drops = getItemSource<Drop[]>(row, DataType.DROPS);
    const alarms = getItemSource<PersistedAlarm[]>(row, DataType.ALARMS);
    const positions = [];
    if (vendors.some(d => d.coords && (d.coords.x !== undefined) && d.mapId === zoneBreakdownRow.mapId)) {
      const vendor = vendors.find(d => d.coords && (d.coords.x !== undefined) && d.mapId === zoneBreakdownRow.mapId);
      positions.push({
        x: vendor.coords.x,
        y: vendor.coords.y,
        type: 'Vendor'
      });
    }
    if (tradeSources.some(d => d.npcs.some(npc => npc.coords && npc.coords.x !== undefined && npc.mapId === zoneBreakdownRow.mapId))) {
      const trade = tradeSources.find(d => d.npcs.some(n => n.coords && n.coords.x !== undefined && n.mapId === zoneBreakdownRow.mapId));
      const npc = trade.npcs.find(n => n.coords && n.coords.x !== undefined && n.mapId === zoneBreakdownRow.mapId);
      positions.push({
        x: npc.coords.x,
        y: npc.coords.y,
        type: 'Trade'
      });
    }
    if ((gatheredBy.nodes || []).some(n => n.x !== undefined && n.map === zoneBreakdownRow.mapId)) {
      const node = gatheredBy.nodes.find(n => n.x !== undefined && n.map === zoneBreakdownRow.mapId);
      positions.push({
        x: node.x,
        y: node.y,
        type: 'Gathering',
        gatheringType: node.type
      });
    }
    if (drops.some(d => d.position && (d.position.x !== undefined) && d.mapid === zoneBreakdownRow.mapId)) {
      const drop = drops.find(d => d.position && (d.position.x !== undefined) && d.mapid === zoneBreakdownRow.mapId && d.position.fate === undefined)
        || drops.find(d => d.position && (d.position.x !== undefined) && d.mapid === zoneBreakdownRow.mapId);
      positions.push({
        x: drop.position.x,
        y: drop.position.y,
        fate: drop.position.fate,
        monster: drop.id,
        type: 'Hunting'
      });
    }
    if (alarms.some(a => a.coords && a.coords.x && a.mapId === zoneBreakdownRow.mapId)) {
      const alarm = alarms.find(a => a.coords && a.coords.x && a.mapId === zoneBreakdownRow.mapId);
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
      if (isGathering || isVendor || isTrade || isHunting) {
        return (p.type === 'Gathering' && isGathering) ||
          (p.type === 'Vendor' && isVendor) ||
          (p.type === 'Trade' && isTrade) ||
          (p.type === 'Hunting' && isHunting);
      }
      return true;
    });
    return preferredPosition || positions[0];
  }

}
