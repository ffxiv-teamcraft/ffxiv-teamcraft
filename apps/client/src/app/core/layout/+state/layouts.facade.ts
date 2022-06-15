import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { LayoutsState } from './layouts.reducer';
import { layoutsQuery } from './layouts.selectors';
import { CreateLayout, DeleteLayout, LoadLayouts, SelectLayout, UpdateLayout } from './layouts.actions';
import { LayoutOrderService } from '../layout-order.service';
import { List } from '../../../modules/list/model/list';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import { LayoutRowDisplay } from '../layout-row-display';
import { debounceTime, expand, filter, map, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
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
import { TeamcraftGearsetStats } from '../../../model/user/teamcraft-gearset-stats';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Injectable({
  providedIn: 'root'
})
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
      shareReplay({ bufferSize: 1, refCount: true })
    );

  constructor(private store: Store<{ layouts: LayoutsState }>, private layoutOrder: LayoutOrderService, private layoutService: LayoutService,
              private authFacade: AuthFacade, private settings: SettingsService, private lazyData: LazyDataFacade) {
  }

  public getDisplay(list: List, adaptativeFilter: boolean, overrideHideCompleted = false): Observable<ListDisplay> {
    const settingsChange$ = this.settings.settingsChange$.pipe(
      filter(name => name === 'maximum-vendor-price'),
      debounceTime(2000),
      startWith('')
    );
    const user$ = this.authFacade.loggedIn$.pipe(
      switchMap(loggedIn => {
        if (loggedIn) {
          return this.authFacade.user$;
        } else {
          return of(null);
        }
      })
    );
    return combineLatest([this.selectedLayout$, user$, settingsChange$, this.lazyData.getEntry('craftingLevels'), this.lazyData.getEntry('gatheringLevels')])
      .pipe(
        withLatestFrom(this.authFacade.gearSets$),
        switchMap(([[layout, user, craftingLevels, gatheringLevels], gearsets]) => {
          let starter: ListRow[];
          if (!layout.considerCrystalsAsItems) {
            starter = (list.items || []).filter(row => row.hidden !== true && (row.id < 1 || row.id > 20) || row.id === row.$key);
          } else {
            starter = (list.items || []).filter(row => row.hidden !== true);
          }
          if (layout.includeRecipesInItems) {
            starter.push(...list.finalItems.map(i => {
              i.finalItem = true;
              return i;
            }));
          }
          return of({
            rows: [], unfilteredRows: starter, layoutRows: [...layout.rows.sort((a, b) => {
              // Other has to be last filter applied, as it rejects nothing.
              if (a.isOtherRow()) {
                return 1;
              }
              if (b.isOtherRow()) {
                return -1;
              }
              return a.index - b.index;
            })]
          }).pipe(
            expand(({ rows, unfilteredRows, layoutRows }) => {
              if (unfilteredRows.length === 0 || layoutRows.length === 0) {
                return EMPTY;
              }
              const row = layoutRows.shift();
              const result: FilterResult = row.doFilter(unfilteredRows, user?.itemTags || [], list, this.settings);
              unfilteredRows = result.rejected;
              // If it's using a tiers display, don't sort now, we'll sort later on, inside the display.
              const orderedAccepted$ = row.tiers ? of(result.accepted) : this.layoutOrder.order(result.accepted, row.orderBy, row.order);
              return orderedAccepted$.pipe(
                map(orderedAccepted => {
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
                      const requiredLevel = Math.min(gatheringLevels[item.id] || 0, gatheredBy.level);
                      if (!layout.filterBasedOnLevel || this.matchesLevel(gearsets, gatherJob, requiredLevel)) {
                        acc.accepted.push(item);
                      } else {
                        acc.rejected.push(item);
                      }
                    } else if (row.filterName.includes('IS_CRAFT') && craftedBy.length > 0) {
                      const match = !layout.filterBasedOnLevel || craftedBy.some((craft) => {
                        const requiredLevel = craftingLevels[craft.id] || 0;
                        return this.matchesLevel(gearsets, craft.job, requiredLevel);
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
                    layoutRows,
                    unfilteredRows,
                    rows: [
                      ...rows,
                      {
                        title: row.name,
                        rows: orderedAccepted,
                        crafts: orderedAccepted.reduce((acc, r) => acc + (r.requires?.length > 0 ? r.amount_needed : 1), 0),
                        index: row.index,
                        zoneBreakdown: row.zoneBreakdown,
                        npcBreakdown: row.npcBreakdown,
                        tiers: row.tiers,
                        reverseTiers: row.reverseTiers,
                        filterChain: row.filter.name,
                        hideIfEmpty: row.hideIfEmpty,
                        collapsed: row.collapseIfDone ? orderedAccepted.reduce((collapse, r) => r.done >= r.amount && collapse, true) : false,
                        collapsedByDefault: row.collapsedByDefault,
                        layoutRow: row,
                        layout: layout,
                        allHQ: orderedAccepted.every(i => i.requiredAsHQ)
                      }
                    ]
                  };
                })
              );
            }),
            map(({ rows }) => {
              return {
                crystalsPanel: !layout.considerCrystalsAsItems,
                showInventory: layout.showInventory,
                showFinalItemsPanel: !layout.includeRecipesInItems,
                rows: rows.filter(row => row.rows.length > 0 || !row.hideIfEmpty)
                  .sort((a, b) => a.index - b.index)
              };
            })
          );
        })
      );
  }

  public getFinalItemsDisplay(list: List, adaptativeFilter: boolean, overrideHideCompleted = false): Observable<LayoutRowDisplay> {
    return this.selectedLayout$.pipe(
      switchMap(layout => {
        return this.layoutOrder.order(list.finalItems, layout.recipeOrderBy, layout.recipeOrder).pipe(
          map(ordered => ({ rows: ordered.filter(row => (layout.recipeHideCompleted || overrideHideCompleted) ? row.done < row.amount : true), layout }))
        );
      }),
      withLatestFrom(this.authFacade.gearSets$),
      map(([{ rows, layout }, gearsets]) => {
        if (adaptativeFilter) {
          rows = rows.filter(item => {
            const gatheredBy = getItemSource(item, DataType.GATHERED_BY);
            const craftedBy = getItemSource(item, DataType.CRAFTED_BY);
            if (gatheredBy.type !== undefined) {
              const gatherJob = [16, 16, 17, 17, 18, 18].indexOf(gatheredBy.type);
              return this.matchesLevel(gearsets, gatherJob, gatheredBy.level);
            }
            if (craftedBy.length > 0) {
              return craftedBy.some((craft) => {
                return this.matchesLevel(gearsets, craft.job, craft.lvl);
              });
            }
            return true;
          });
        }
        return {
          title: 'Items',
          rows: rows,
          crafts: rows.reduce((acc, r) => acc + (r.requires?.length > 0 ? r.amount_needed : 1), 0),
          // Random number, as this panel isn't ordered at all
          index: 10000,
          hideIfEmpty: false,
          zoneBreakdown: layout.recipeZoneBreakdown,
          npcBreakdown: false,
          tiers: false,
          reverseTiers: false,
          filterChain: '',
          collapsed: false,
          layoutRow: null,
          layout: layout,
          allHQ: rows.every(i => i.requiredAsHQ)
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

  private matchesLevel(sets: TeamcraftGearsetStats[], job: number, level: number): boolean {
    const set = sets.find(s => s.jobId === job);
    // If we don't find a matching set, return true, they just didn't fill this one.
    return !set || set.level === 0 || set.level >= level;
  }
}
