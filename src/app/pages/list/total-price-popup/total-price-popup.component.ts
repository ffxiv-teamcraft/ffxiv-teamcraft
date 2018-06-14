import {Component, Inject, OnInit} from '@angular/core';
import {ListRow} from '../../../model/list/list-row';
import {MAT_DIALOG_DATA} from '@angular/material';
import {TradeSource} from '../../../model/list/trade-source';
import {ItemComponent} from '../../../modules/item/item/item.component';

@Component({
    selector: 'app-total-price-popup',
    templateUrl: './total-price-popup.component.html',
    styleUrls: ['./total-price-popup.component.scss']
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
                        result.push({currencyId: -1, currencyIcon: -1, amount: vendor.price * (row.amount - row.done)});
                    } else {
                        gilsRow.amount += vendor.price * (row.amount - row.done);
                    }
                });
            } else if (row.tradeSources !== undefined && row.tradeSources.length > 0) {
                const tradeSource = this.getTradeSourceByPriority(row.tradeSources);
                const trade = tradeSource.trades.sort((ta, tb) => ta.currencyAmount / ta.itemAmount - tb.currencyAmount / tb.itemAmount)[0];
                const tradeRow = result.find(r => r.currencyId === trade.currencyId);
                if (tradeRow === undefined) {
                    result.push({
                        currencyId: trade.currencyId,
                        currencyIcon: trade.currencyIcon,
                        amount: trade.currencyAmount * (row.amount - row.done)
                    });
                } else {
                    tradeRow.amount += trade.currencyAmount * (row.amount - row.done);
                }
            }
            return result;
        }, []);
    }

}
