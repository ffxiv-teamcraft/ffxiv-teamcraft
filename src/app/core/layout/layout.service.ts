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

@Injectable()
export class LayoutService {

    private _layout: ListLayout = new ListLayout();

    constructor(private serializer: NgSerializerService, private layoutOrder: LayoutOrderService) {
        this.load();
        if (this._layout.rows.length === 0) {
            this._layout.rows = this.defaultLayout;
        }
    }

    public getDisplay(list: List): LayoutRowDisplay[] {
        if (this.layoutRows.find(row => row.filter.name === 'ANYTHING') === undefined) {
            throw new Error('List layoutRows has to contain an ANYTHING category');
        }
        let unfilteredRows = list.items;
        return this.layoutRows.map(row => {
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
    }

    public get layoutRows(): LayoutRow[] {
        return this._layout.rows.sort((a, b) => {
            // ANYTHING has to be last filter applied, as it rejects nothing.
            if (a.filter.name === 'ANYTHING') {
                return 10000;
            }
            return a.order - b.order;
        });
    }

    public get layout(): ListLayout {
        return this._layout;
    }

    public persist(): void {
        localStorage.setItem('layout', btoa(JSON.stringify(this._layout.rows)));
    }

    private load(): void {
        if (localStorage.getItem('layout') !== null) {
            this._layout.rows = this.serializer.deserialize<LayoutRow>(JSON.parse(atob(localStorage.getItem('layout'))), [LayoutRow]);
        } else {
            this._layout.rows = [];
        }
    }

    public get defaultLayout(): LayoutRow[] {
        return [
            new LayoutRow('Gathering', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_GATHERING.name, 0),
            new LayoutRow('Pre_crafts', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.IS_CRAFT.name, 3),
            new LayoutRow('Other', 'NAME', LayoutRowOrder.DESC, LayoutRowFilter.ANYTHING.name, 2),
        ]
    }

}
