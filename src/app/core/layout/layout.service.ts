import {Injectable} from '@angular/core';
import {LayoutRow} from './layout-row';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {LayoutRowOrder} from './layout-row-order.enum';
import {LayoutRowFilter} from './layout-row-filter';
import {LayoutRowDisplay} from './layout-row-display';
import {List} from '../../model/list/list';
import {FilterResult} from './filter-result';
import {ListLayout} from './list-layout';
import {LayoutOrderService} from './layout-order.service';
import {Observable, of} from 'rxjs';
import {UserService} from '../database/user.service';
import {ListRow} from '../../model/list/list-row';
import {catchError, first, map, mergeMap} from 'rxjs/operators';

@Injectable()
export class LayoutService {

    private _layouts: Observable<ListLayout[]>;

    constructor(private serializer: NgSerializerService, private layoutOrder: LayoutOrderService, private userService: UserService) {
        this._layouts =
            this.userService.getUserData()
                .pipe(
                    map(userData => {
                        const layouts = userData.layouts;
                        if (layouts === undefined || layouts === null || layouts.length === 0 ||
                            (layouts.length === 1 && layouts[0].name === 'Default layout')) {
                            return [new ListLayout('Default layout', this.defaultLayout)];
                        }
                        return layouts;
                    }),
                    map(layouts => {
                        return layouts.map(layout => {
                            if (layout.rows.length === 0) {
                                layout.rows = this.defaultLayout;
                            }
                            return layout;
                        });
                    })
                );
    }

    public getDisplay(list: List, index: number): Observable<LayoutRowDisplay[]> {
        return this.getLayoutRows(index)
            .pipe(
                catchError(() => of(this.defaultLayout)),
                map(layoutRows => {
                    if (layoutRows.find(row => row.filter.name === 'ANYTHING') === undefined) {
                        throw new Error('List layoutRows has to contain an ANYTHING category');
                    }
                    let unfilteredRows = list.items.filter(row => row.hidden !== true);
                    return layoutRows.map(row => {
                        const result: FilterResult = row.filter.filter(unfilteredRows);
                        unfilteredRows = result.rejected;
                        const orderedAccepted = this.layoutOrder.order(result.accepted, row.orderBy, row.order);
                        return {
                            title: row.name,
                            rows: orderedAccepted,
                            index: row.index,
                            zoneBreakdown: row.zoneBreakdown,
                            tiers: row.tiers,
                            filterChain: row.filter.name,
                            hideIfEmpty: row.hideIfEmpty,
                        };
                    }).sort((a, b) => a.index - b.index);
                })
            );
    }

    public getRecipes(list: List, index: number): Observable<ListRow[]> {
        return this.getLayout(index)
            .pipe(
                map(layout => {
                    return this.layoutOrder.order(list.recipes, layout.recipeOrderBy, layout.recipeOrder);
                })
            );
    }

    public getLayoutRows(index: number): Observable<LayoutRow[]> {
        return this.getLayout(index)
            .pipe(
                map(layout => {
                    if (layout === undefined) {
                        layout = new ListLayout('Default layout', this.defaultLayout);
                    }
                    return layout.rows.sort((a, b) => {
                        // ANYTHING has to be last filter applied, as it rejects nothing.
                        if (a.filter.name === 'ANYTHING') {
                            return 1;
                        }
                        if (b.filter.name === 'ANYTHING') {
                            return -1;
                        }
                        return a.index - b.index;
                    });
                })
            );
    }

    public getLayout(index: number): Observable<ListLayout> {
        return this._layouts.pipe(map(layouts => layouts[index] || new ListLayout('Default layout', this.defaultLayout)));
    }

    public get layouts(): Observable<ListLayout[]> {
        return this._layouts;
    }

    public persist(layouts: ListLayout[]): Observable<void> {
        return this.userService.getUserData()
            .pipe(
                first(),
                mergeMap(user => {
                    user.layouts = layouts;
                    return this.userService.set(user.$key, user);
                })
            );
    }

    public get defaultLayout(): LayoutRow[] {
        return [
            new LayoutRow('Timed nodes', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_TIMED.name,
                0, true, false, true),
            new LayoutRow('Vendors ', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.CAN_BE_BOUGHT.name,
                1, false, true, true),
            new LayoutRow('Reducible', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_REDUCTION.name,
                2, false, false, true),
            new LayoutRow('Tomes/Tokens/Scripts', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_TOKEN_TRADE.name,
                3, false, false, true),
            new LayoutRow('Fishing', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_GATHERED_BY_FSH.name,
                4, false, false, true),
            new LayoutRow('Gatherings', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_GATHERING.name,
                5, true, false, true),
            new LayoutRow('Dungeons/Drops or GC', 'NAME', LayoutRowOrder.DESC,
                LayoutRowFilter.IS_MONSTER_DROP.name + ':or:' + LayoutRowFilter.IS_GC_TRADE.name,
                6, false, false, true),
            new LayoutRow('Pre_crafts', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_CRAFT.name,
                8, false, true, true),
            new LayoutRow('Other', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.ANYTHING.name,
                7, true, false, true),
        ]
    }

}
