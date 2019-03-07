import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { LayoutsState } from './layouts.reducer';
import { layoutsQuery } from './layouts.selectors';
import { CreateLayout, DeleteLayout, LoadLayouts, SelectLayout, UpdateLayout } from './layouts.actions';
import { LayoutOrderService } from '../layout-order.service';
import { List } from '../../../modules/list/model/list';
import { Observable, of } from 'rxjs';
import { LayoutRowDisplay } from '../layout-row-display';
import { map, shareReplay, withLatestFrom } from 'rxjs/operators';
import { FilterResult } from '../filter-result';
import { ListLayout } from '../list-layout';
import { LayoutService } from '../layout.service';
import { ListRow } from '../../../modules/list/model/list-row';
import { ListDisplay } from '../list-display';
import { AuthFacade } from '../../../+state/auth.facade';

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
        return layout;
      }),
      shareReplay(1)
    );

  constructor(private store: Store<{ layouts: LayoutsState }>, private layoutOrder: LayoutOrderService, private layoutService: LayoutService,
              private authFacade: AuthFacade) {
  }

  public getDisplay(list: List, adaptativeFilter: boolean, overrideHideCompleted = false): Observable<ListDisplay> {
    return this.selectedLayout$
      .pipe(
        withLatestFrom(adaptativeFilter ? this.authFacade.mainCharacterEntry$ : of(null)),
        map(([layout, characterEntry]) => {
          let unfilteredRows: ListRow[];
          if (!layout.considerCrystalsAsItems) {
            unfilteredRows = list.items.filter(row => row.hidden !== true && (row.id < 1 || row.id > 20) || row.id === row.$key);
          } else {
            unfilteredRows = list.items.filter(row => row.hidden !== true);
          }
          return {
            crystalsPanel: !layout.considerCrystalsAsItems,
            showInventory: layout.showInventory,
            rows: layout.rows
              .filter(row => row !== undefined)
              .sort((a, b) => {
                // ANYTHING has to be last filter applied, as it rejects nothing.
                if (a.filter.name === 'ANYTHING') {
                  return 1;
                }
                if (b.filter.name === 'ANYTHING') {
                  return -1;
                }
                return a.index - b.index;
              })
              .map(row => {
                const result: FilterResult = row.filter.filter(unfilteredRows);
                unfilteredRows = result.rejected;
                // If it's using a tiers display, don't sort now, we'll sort later on, inside the display.
                let orderedAccepted = row.tiers ? result.accepted : this.layoutOrder.order(result.accepted, row.orderBy, row.order);
                if (row.hideCompletedRows || overrideHideCompleted) {
                  orderedAccepted = orderedAccepted.filter(item => item.done < item.amount);
                }
                if (row.hideUsedRows) {
                  orderedAccepted = orderedAccepted.filter(item => item.used < item.amount);
                }
                if (adaptativeFilter) {
                  orderedAccepted = orderedAccepted.filter(item => {
                    if (item.gatheredBy !== undefined) {
                      const gatherJob = [16, 16, 17, 17, 18, 18][item.gatheredBy.type];
                      const set = (characterEntry.stats || []).find(stat => stat.jobId === gatherJob);
                      return set && set.level >= item.gatheredBy.level;
                    }
                    if (item.craftedBy !== undefined && item.craftedBy.length > 0) {
                      return item.craftedBy.reduce((canCraft, craft) => {
                        const jobId = craft.jobId;
                        const set = (characterEntry.stats || []).find(stat => stat.jobId === jobId);
                        return (set && set.level >= craft.level) || canCraft;
                      }, false);
                    }
                    return true;
                  });
                }
                return {
                  title: row.name,
                  rows: orderedAccepted,
                  index: row.index,
                  zoneBreakdown: row.zoneBreakdown,
                  tiers: row.tiers,
                  filterChain: row.filter.name,
                  hideIfEmpty: row.hideIfEmpty,
                  collapsed: row.collapseIfDone ? orderedAccepted.reduce((collapse, r) => r.done >= r.amount && collapse, true) : false,
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

  public getFinalItemsDisplay(list: List, adaptativeFilter: boolean): Observable<LayoutRowDisplay> {
    return this.selectedLayout$.pipe(
      withLatestFrom(adaptativeFilter ? this.authFacade.mainCharacterEntry$ : of(null)),
      map(([layout, characterEntry]) => {
        let rows = this.layoutOrder.order(list.finalItems, layout.recipeOrderBy, layout.recipeOrder)
          .filter(row => layout.recipeHideCompleted ? row.done < row.amount : true);
        if (adaptativeFilter) {
          rows = rows.filter(item => {
            if (item.gatheredBy !== undefined) {
              const gatherJob = [16, 16, 17, 17, 18, 18].indexOf(item.gatheredBy.type);
              const set = (characterEntry.stats || []).find(stat => stat.jobId === gatherJob);
              return set && set.level >= item.gatheredBy.level;
            }
            if (item.craftedBy !== undefined && item.craftedBy.length > 0) {
              return item.craftedBy.reduce((canCraft, craft) => {
                const jobId = craft.jobId;
                const set = (characterEntry.stats || []).find(stat => stat.jobId === jobId);
                return (set && set.level >= craft.level) || canCraft;
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

  loadAll() {
    this.store.dispatch(new LoadLayouts());
    const selectedKey = localStorage.getItem('layout:selected');
    if (selectedKey !== null) {
      this.store.dispatch(new SelectLayout(selectedKey));
    }
  }
}
