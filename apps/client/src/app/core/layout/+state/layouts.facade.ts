import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { LayoutsState } from './layouts.reducer';
import { layoutsQuery } from './layouts.selectors';
import { CreateLayout, DeleteLayout, LoadLayouts, SelectLayout, UpdateLayout } from './layouts.actions';
import { LayoutOrderService } from '../layout-order.service';
import { List } from '../../../modules/list/model/list';
import { Observable } from 'rxjs';
import { LayoutRowDisplay } from '../layout-row-display';
import { filter, map } from 'rxjs/operators';
import { FilterResult } from '../filter-result';
import { ListLayout } from '../list-layout';
import { LayoutService } from '../layout.service';
import { LayoutRow } from '../layout-row';
import { ListRow } from '../../../modules/list/model/list-row';
import { ListDisplay } from '../list-display';

@Injectable()
export class LayoutsFacade {
  loaded$ = this.store.select(layoutsQuery.getLoaded);
  allLayouts$ = this.store.select(layoutsQuery.getAllLayouts);

  selectedLayout$: Observable<ListLayout> = this.store.select(layoutsQuery.getSelectedLayout)
    .pipe(
      filter(layout => layout !== undefined)
    );

  constructor(private store: Store<{ layouts: LayoutsState }>, private layoutOrder: LayoutOrderService, private layoutService: LayoutService) {
  }

  public getDisplay(list: List): Observable<ListDisplay> {
    return this.selectedLayout$
      .pipe(
        map(layout => {
          let unfilteredRows: ListRow[];
          if (!layout.considerCrystalsAsItems) {
            unfilteredRows = list.items.filter(row => row.hidden !== true && (row.id < 1 || row.id > 20));
          } else {
            unfilteredRows = list.items.filter(row => row.hidden !== true);
          }
          return {
            crystalsPanel: !layout.considerCrystalsAsItems,
            rows: layout.rows
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
                let orderedAccepted = this.layoutOrder.order(result.accepted, row.orderBy, row.order);
                if (row.hideCompletedRows) {
                  orderedAccepted = orderedAccepted.filter(item => item.done < item.amount);
                }
                if (row.hideUsedRows) {
                  orderedAccepted = orderedAccepted.filter(item => item.used < item.amount);
                }
                return {
                  title: row.name,
                  rows: orderedAccepted,
                  index: row.index,
                  zoneBreakdown: row.zoneBreakdown,
                  tiers: row.tiers,
                  filterChain: row.filter.name,
                  hideIfEmpty: row.hideIfEmpty,
                  collapsed: row.collapseIfDone ? orderedAccepted.reduce((collapse, row) => row.done >= row.amount && collapse, true) : false
                };
              })
              // row.rows.length > 0 || !row.hideIfEmpty is !(row.rows.length === 0 && row.hideIfEmpty)
              .filter(row => row.rows.length > 0 || !row.hideIfEmpty)
              .sort((a, b) => a.index - b.index)
          };
        })
      );
  }

  public getFinalItemsDisplay(list: List): Observable<LayoutRowDisplay> {
    return this.selectedLayout$.pipe(
      map(layout => {
        return {
          title: 'Items',
          rows: this.layoutOrder.order(list.finalItems, layout.recipeOrderBy, layout.recipeOrder),
          // Random number, as this panel isn't ordered at all
          index: 10000,
          hideIfEmpty: false,
          zoneBreakdown: layout.recipeZoneBreakdown,
          tiers: false,
          filterChain: '',
          collapsed: false
        };
      })
    );
  }

  public createNewLayout(name = 'New layout', content?: LayoutRow[]): void {
    const layout = new ListLayout();
    layout.name = name;
    layout.rows = content || this.layoutService.defaultLayout.rows;
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
  }

  loadAll() {
    this.store.dispatch(new LoadLayouts());
  }
}
