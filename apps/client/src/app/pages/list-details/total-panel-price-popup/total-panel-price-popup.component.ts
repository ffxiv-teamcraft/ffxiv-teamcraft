import { Component, OnInit } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { TradeIconPipe } from '../trade-icon.pipe';
import { TradeSource } from '../../../modules/list/model/trade-source';

@Component({
  selector: 'app-total-panel-price-popup',
  templateUrl: './total-panel-price-popup.component.html',
  styleUrls: ['./total-panel-price-popup.component.less']
})
export class TotalPanelPricePopupComponent implements OnInit {

  public totalPrice: { currencyId: number, currencyIcon: number, amount: number }[] = [];

  public panelContent: ListRow[] = [];

  constructor() {
  }

  getTradeSourceByPriority(tradeSources: TradeSource[]): TradeSource {
    return tradeSources.sort((a, b) => {
      return TradeIconPipe.TRADE_SOURCES_PRIORITIES[a.trades[0].currencies[0].id]
      > TradeIconPipe.TRADE_SOURCES_PRIORITIES[b.trades[0].currencies[0].id] ? -1 : 1;
    })[0];
  }

  ngOnInit(): void {
    this.totalPrice = this.panelContent.reduce((result, row) => {
      if (row.vendors !== null && row.vendors.length > 0) {
        row.vendors.forEach(vendor => {
          // We'll use -1 as currencyId for gil.
          const gilsRow = result.find(r => r.currencyId === -1);
          if (gilsRow === undefined) {
            result.push({ currencyId: -1, currencyIcon: -1, costs: [vendor.price * (row.amount - row.done)] });
          } else {
            gilsRow.costs[0] += vendor.price * (row.amount - row.done);
          }
        });
      } else if (row.tradeSources !== undefined && row.tradeSources.length > 0) {
        const tradeSource = this.getTradeSourceByPriority(row.tradeSources);
        const trade = tradeSource.trades[0];
        const costs = tradeSource.trades.sort((ta) => ta.items[0].hq ? 1 : -1).map(t => {
          return t.currencies[0].amount * (row.amount - row.done);
        });
        const tradeRow = result.find(r => r.currencyId === trade.currencies[0].id);

        if (tradeRow === undefined) {
          result.push({
            currencyId: trade.currencies[0].id,
            currencyIcon: trade.currencies[0].icon,
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
