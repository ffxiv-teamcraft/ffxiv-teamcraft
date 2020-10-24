import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { LayoutsState } from './layouts.reducer';
import { layoutsQuery } from './layouts.selectors';
import { CreateLayout, DeleteLayout, LoadLayouts, SelectLayout, UpdateLayout } from './layouts.actions';
import { LayoutOrderService } from '../layout-order.service';
import { List } from '../../../modules/list/model/list';
import { combineLatest, Observable, of } from 'rxjs';
import { LayoutRowDisplay } from '../layout-row-display';
import { debounceTime, filter, map, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';
import { FilterResult } from '../filter-result';
import { ListLayout } from '../list-layout';
import { LayoutService } from '../layout.service';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { ListDisplay } from '../list-display';
import { AuthFacade } from '../../../+state/auth.facade';
import { LayoutRow } from '../layout-row';
import { LayoutRowOrder } from '../layout-row-order.enum';
import { LayoutRowFilter } from '../layout-row-filter';
import { DataType } from '../../../modules/list/data/data-type';
import { SettingsService } from '../../../modules/settings/settings.service';

@Injectable()
export class LayoutsFacade {
  loaded$ = this.store.select(layoutsQuery.getLoaded);
  allLayouts$ = this.store.select(layoutsQuery.getAllLayouts);

  selectedLayout$: Observable<ListLayout> = this.store.select(layoutsQuery.getSelectedLayout)
    .pipe(
      map(layout => {
        if (layout === undefined) {
          return this.layoutService.defaultLayout;
        }
        return layout;
      }),
      map(layout => {
        layout.rows = layout.rows.sort((a, b) => a.index - b.index);
        if (!layout.rows.some(row => row.isOtherRow && row.isOtherRow())) {
          layout.rows.push(new LayoutRow('Other', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.ANYTHING.name,
            7, true, false, true, false, false, true));
        }
        return layout;
      }),
      shareReplay(1)
    );

  constructor(private store: Store<{ layouts: LayoutsState }>, private layoutOrder: LayoutOrderService, private layoutService: LayoutService,
              private authFacade: AuthFacade, private settings: SettingsService) {
  }

  public getDisplay(list: List, adaptativeFilter: boolean, overrideHideCompleted = false): Observable<ListDisplay> {
    const settingsChange$ = this.settings.settingsChange$.pipe(
      filter(name => name === 'maximum-vendor-price'),
      debounceTime(2000),
      startWith('')
    );
    return combineLatest([this.selectedLayout$, this.authFacade.user$, settingsChange$])
      .pipe(
        withLatestFrom(this.authFacade.gearSets$),
        map(([[layout, user], gearsets]) => {
          let unfilteredRows: ListRow[];
          if (!layout.considerCrystalsAsItems) {
            unfilteredRows = (list.items || []).filter(row => row.hidden !== true && (row.id < 1 || row.id > 20) || row.id === row.$key);
          } else {
            unfilteredRows = (list.items || []).filter(row => row.hidden !== true);
          }
          if (layout.includeRecipesInItems) {
            unfilteredRows.push(...list.finalItems.map(i => {
              i.finalItem = true;
              return i;
            }));
          }
          return {
            crystalsPanel: !layout.considerCrystalsAsItems,
            showInventory: layout.showInventory,
            showFinalItemsPanel: !layout.includeRecipesInItems,
            rows: layout.rows
              .filter(row => row !== undefined)
              .sort((a, b) => {
                // Other has to be last filter applied, as it rejects nothing.
                if (a.isOtherRow()) {
                  return 1;
                }
                if (b.isOtherRow()) {
                  return -1;
                }
                return a.index - b.index;
              })
              .map((row: LayoutRow) => {
                const result: FilterResult = row.doFilter(unfilteredRows, user.itemTags, list, this.settings);
                unfilteredRows = result.rejected;
                // If it's using a tiers display, don't sort now, we'll sort later on, inside the display.
                let orderedAccepted = row.tiers ? result.accepted : this.layoutOrder.order(result.accepted, row.orderBy, row.order);
                if (row.hideCompletedRows || overrideHideCompleted) {
                  orderedAccepted = orderedAccepted.filter(item => item.done < item.amount);
                }
                if (row.hideUsedRows) {
                  orderedAccepted = orderedAccepted.filter(item => item.used < item.amount);
                }
                const resultWithLevel: FilterResult = orderedAccepted.reduce((acc, item) => {
                  const gatheredBy = getItemSource(item, DataType.GATHERED_BY);
                  const craftedBy = getItemSource(item, DataType.CRAFTED_BY);
                  if (row.filterName.includes('IS_GATHERING') && gatheredBy.type !== undefined) {
                    const gatherJob = [16, 16, 17, 17, 18, 18][gatheredBy.type];
                    const set = gearsets.find(stat => stat.jobId === gatherJob);
                    if (set && (set.level === 0 || set.level >= gatheredBy.level)) {
                      acc.accepted.push(item);
                    } else {
                      acc.rejected.push(item);
                    }
                  } else if (row.filterName.includes('IS_CRAFT') && craftedBy.length > 0) {
                    const match = craftedBy.some((craft) => {
                      const set = gearsets.find(stat => stat.jobId === craft.job);
                      return set && (set.level === 0 || set.level >= craft.lvl);
                    });
                    if (match) {
                      acc.accepted.push(item);
                    } else {
                      acc.rejected.push(item);
                    }
                  } else {
                    acc.accepted.push(item);
                  }
                  return acc;
                }, { accepted: [], rejected: [] });
                orderedAccepted = resultWithLevel.accepted;
                if (!adaptativeFilter) {
                  unfilteredRows.push(...resultWithLevel.rejected);
                }
                return {
                  title: row.name,
                  rows: orderedAccepted,
                  index: row.index,
                  zoneBreakdown: row.zoneBreakdown,
                  tiers: row.tiers,
                  reverseTiers: row.reverseTiers,
                  filterChain: row.filter.name,
                  hideIfEmpty: row.hideIfEmpty,
                  collapsed: row.collapseIfDone ? orderedAccepted.reduce((collapse, r) => r.done >= r.amount && collapse, true) : false,
                  collapsedByDefault: row.collapsedByDefault,
                  layoutRow: row,
                  layout: layout
                };
              })
              // row.rows.length > 0 || !row.hideIfEmpty is !(row.rows.length === 0 && row.hideIfEmpty)
              .filter(row => row.rows.length > 0 || !row.hideIfEmpty)
              .sort((a, b) => a.index - b.index)
          };
        })
      );
  }

  public getFinalItemsDisplay(list: List, adaptativeFilter: boolean, overrideHideCompleted = false): Observable<LayoutRowDisplay> {
    return this.selectedLayout$.pipe(
      withLatestFrom(adaptativeFilter ? this.authFacade.mainCharacterEntry$ : of(null)),
      map(([layout, characterEntry]) => {
        let rows = this.layoutOrder.order(list.finalItems, layout.recipeOrderBy, layout.recipeOrder)
          .filter(row => (layout.recipeHideCompleted || overrideHideCompleted) ? row.done < row.amount : true);
        if (adaptativeFilter) {
          rows = rows.filter(item => {
            const gatheredBy = getItemSource(item, DataType.GATHERED_BY);
            const craftedBy = getItemSource(item, DataType.CRAFTED_BY);
            if (gatheredBy.type !== undefined) {
              const gatherJob = [16, 16, 17, 17, 18, 18].indexOf(gatheredBy.type);
              const set = (characterEntry.stats || []).find(stat => stat.jobId === gatherJob);
              return set && set.level >= gatheredBy.level;
            }
            if (craftedBy.length > 0) {
              return craftedBy.reduce((canCraft, craft) => {
                const set = (characterEntry.stats || []).find(stat => stat.jobId === craft.job);
                return (set && set.level >= craft.lvl) || canCraft;
              }, false);
            }
            return true;
          });
        }
        return {
          title: 'Items',
          rows: rows,
          // Random number, as this panel isn't ordered at all
          index: 10000,
          hideIfEmpty: false,
          zoneBreakdown: layout.recipeZoneBreakdown,
          tiers: false,
          reverseTiers: false,
          filterChain: '',
          collapsed: false,
          layoutRow: null,
          layout: layout
        };
      })
    );
  }

  public createNewLayout(name = 'New layout', baseLayout?: ListLayout): void {
    const layout = new ListLayout();
    Object.assign(layout, baseLayout);
    layout.name = (baseLayout && baseLayout.name) || name;
    layout.rows = layout.rows || this.layoutService.defaultLayout.rows;
    this.store.dispatch(new CreateLayout(layout));
  }

  public deleteLayout(key: string): void {
    this.store.dispatch(new DeleteLayout(key));
  }

  public updateLayout(layout: ListLayout): void {
    this.store.dispatch(new UpdateLayout(layout));
  }

  select(layout: ListLayout): void {
    this.store.dispatch(new SelectLayout(layout.$key));
    localStorage.setItem('layout:selected', layout.$key);
  }

  selectFromOverlay(key: string): void {
    this.store.dispatch(new SelectLayout(key));
  }

  loadAll() {
    this.store.dispatch(new LoadLayouts());
    const selectedKey = localStorage.getItem('layout:selected');
    if (selectedKey !== null) {
      this.store.dispatch(new SelectLayout(selectedKey));
    }
  }
}
