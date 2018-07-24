import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {ListRow} from '../../../model/list/list-row';
import {MAT_DIALOG_DATA} from '@angular/material';
import {TradeSource} from '../../../model/list/trade-source';
import {ItemComponent} from '../../../modules/item/item/item.component';

@Component({
    selector: 'app-total-price-popup',
    templateUrl: './total-price-popup.component.html',
    styleUrls: ['./total-price-popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TotalPricePopupComponent implements OnInit {

    totalPrice: { currencyId: number, currencyIcon: number, amount: number }[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) private rows: ListRow[]) {
    }

    getTradeSourceByPriority(tradeSources: TradeSource[]): TradeSource {
        return tradeSources.sort((a, b) => {
            return ItemComponent.TRADE_SOURCES_PRIORITIES[a.trades[0].currencyId]
            > ItemComponent.TRADE_SOURCES_PRIORITIES[b.trades[0].currencyId] ? -1 : 1;
        })[0];
    }

    ngOnInit() {
        this.totalPrice = this.rows.reduce((result, row) => {
            if (row.vendors !== null && row.vendors.length > 0) {
                row.vendors.forEach(vendor => {
                    // We'll use -1 as currencyId for gil.
                    const gilsRow = result.find(r => r.currencyId === -1);
                    if (gilsRow === undefined) {
                        result.push({currencyId: -1, currencyIcon: -1, costs: [vendor.price * (row.amount - row.done)]});
                    } else {
                        gilsRow.costs[0] += vendor.price * (row.amount - row.done);
                    }
                });
            } else if (row.tradeSources !== undefined && row.tradeSources.length > 0) {
                const tradeSource = this.getTradeSourceByPriority(row.tradeSources);
                const trade = tradeSource.trades[0];
                const costs = tradeSource.trades.sort((ta, tb) => ta.itemHQ ? 1 : 0).map(t => {
                    return t.currencyAmount * (row.amount - row.done);
                });
                const tradeRow = result.find(r => r.currencyId === trade.currencyId);

                if (tradeRow === undefined) {
                    result.push({
                        currencyId: trade.currencyId,
                        currencyIcon: trade.currencyIcon,
                        costs: costs
                    });
                } else {
                    tradeRow.costs[0] += costs[0];
                    tradeRow.costs[1] += costs[1];
                }
            }

            return result;
        }, []);
    }

}
