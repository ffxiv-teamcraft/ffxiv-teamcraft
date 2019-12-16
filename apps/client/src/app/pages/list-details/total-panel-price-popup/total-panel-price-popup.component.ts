import { Component, OnInit } from '@angular/core';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { TradeIconPipe } from '../trade-icon.pipe';
import { TradeSource } from '../../../modules/list/model/trade-source';
import { TradeEntry } from '../../../modules/list/model/trade-entry';
import { DataType } from '../../../modules/list/data/data-type';

@Component({
  selector: 'app-total-panel-price-popup',
  templateUrl: './total-panel-price-popup.component.html',
  styleUrls: ['./total-panel-price-popup.component.less']
})
export class TotalPanelPricePopupComponent implements OnInit {

  public totalPrice: { currencyId: number, currencyIcon: number, amount: number, canIgnore: boolean }[] = [];

  public panelContent: ListRow[] = [];

  public ignoredSources = [];

  getTradeSourceByPriority(tradeSources: TradeSource[]): TradeSource {
    return tradeSources
      .filter(source => {
        return this.getFilteredCurrencies(source.trades[0].currencies).length > 0;
      })
      .sort((a, b) => {
        return TradeIconPipe.TRADE_SOURCES_PRIORITIES[this.getFilteredCurrencies(a.trades[0].currencies)[0].id]
        > TradeIconPipe.TRADE_SOURCES_PRIORITIES[this.getFilteredCurrencies(b.trades[0].currencies)[0].id] ? 1 : -1;
      })[0];
  }

  private getFilteredCurrencies(currencies: TradeEntry[]): TradeEntry[] {
    return currencies.filter(c => {
      return !this.ignoredSources.includes(c.id);
    });
  }

  private computePrice(): void {
    this.totalPrice = this.panelContent.reduce((result, row) => {
      const vendors = getItemSource(row, DataType.VENDORS);
      const tradeSources = getItemSource(row, DataType.TRADE_SOURCES);
      if (vendors) {
        const vendor = vendors.data
          .sort((a, b) => {
            return a.price - b.price;
          })[0];
        const gilsRow = result.find(r => r.currencyId === -1);
        if (gilsRow === undefined) {
          result.push({ currencyId: -1, currencyIcon: -1, costs: [vendor.price * (row.amount - row.done)] });
        } else {
          gilsRow.costs[0] += vendor.price * (row.amount - row.done);
        }
      } else if (tradeSources) {
        const tradeSource = this.getTradeSourceByPriority(tradeSources.data);
        const trade = tradeSource.trades[0];
        const itemsPerTrade = trade.items.find(item => item.id === row.id).amount;
        const costs = tradeSource.trades.sort((ta) => ta.items[0].hq ? 1 : -1).map(t => {
          return Math.ceil(this.getFilteredCurrencies(t.currencies)[0].amount * (row.amount - row.done) / itemsPerTrade);
        });

        const tradeRow = result.find(r => r.currencyId === this.getFilteredCurrencies(trade.currencies)[0].id);

        if (tradeRow === undefined) {
          result.push({
            currencyId: this.getFilteredCurrencies(trade.currencies)[0].id,
            currencyIcon: this.getFilteredCurrencies(trade.currencies)[0].icon,
            costs: costs,
            canIgnore: [].concat.apply([], tradeSources.data.filter(source => {
              return source.trades.some(t => {
                return this.getFilteredCurrencies(t.currencies).length > 0;
              });
            })).length > 1
          });
        } else {
          tradeRow.costs[0] += costs[0];
          tradeRow.costs[1] += costs[1];
        }
      }

      return result;
    }, []);
  }

  ngOnInit(): void {
    this.computePrice();
  }

}
