import { Component, OnInit } from '@angular/core';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { TradeIconPipe } from '../../../pipes/pipes/trade-icon.pipe';
import { TradeSource } from '../../../modules/list/model/trade-source';
import { TradeEntry } from '../../../modules/list/model/trade-entry';
import { DataType } from '../../../modules/list/data/data-type';
import { uniqBy } from 'lodash';

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
        return this.getTradeEntries(source).length > 0;
      })
      .sort((a, b) => {
        return TradeIconPipe.TRADE_SOURCES_PRIORITIES[this.getTradeEntries(a)[0].id]
        > TradeIconPipe.TRADE_SOURCES_PRIORITIES[this.getTradeEntries(b)[0].id] ? 1 : -1;
      })[0];
  }

  private getTradeEntries(tradeSource: TradeSource): TradeEntry[] {
    return tradeSource.trades.reduce((acc, trade) => {
      return [
        ...acc,
        ...this.getFilteredCurrencies(trade.currencies)
      ];
    }, []);
  }

  private getFilteredCurrencies(currencies: TradeEntry[]): TradeEntry[] {
    return currencies.filter(c => {
      return !this.ignoredSources.includes(c.id);
    });
  }

  public computePrice(): void {
    this.totalPrice = this.panelContent.reduce((result, row) => {
      const vendors = getItemSource(row, DataType.VENDORS);
      const tradeSources = getItemSource(row, DataType.TRADE_SOURCES);
      if (vendors.length > 0) {
        const vendor = vendors
          .sort((a, b) => {
            return a.price - b.price;
          })[0];
        const gilsRow = result.find(r => r.currencyId === -1);
        if (gilsRow === undefined) {
          result.push({ currencyId: -1, currencyIcon: -1, costs: [vendor.price * (row.amount - row.done)] });
        } else {
          gilsRow.costs[0] += vendor.price * (row.amount - row.done);
        }
      } else if (tradeSources.length > 0) {
        const tradeSource = this.getTradeSourceByPriority(tradeSources);
        const trade = tradeSource.trades[0];
        const itemsPerTrade = trade.items.find(item => item.id === row.id).amount;
        this.getFilteredCurrencies(trade.currencies).forEach(currency => {
          const costs = tradeSource.trades
            .sort((ta) => ta.items[0].hq ? 1 : -1)
            .map(t => {
              const e = t.currencies.find(c => c.id === currency.id);
              if (e) {
                return Math.ceil(e.amount * (row.amount - row.done) / itemsPerTrade);
              }
              return null;
            });

          const tradeRow = result.find(r => r.currencyId === currency.id);

          if (tradeRow === undefined) {
            result.push({
              currencyId: currency.id,
              currencyIcon: currency.icon,
              costs: costs,
              canIgnore: uniqBy(this.getTradeEntries(tradeSource), 'id').length > 1
            });
          } else {
            tradeRow.costs[0] = (tradeRow.costs[0] || 0) + costs[0];
            tradeRow.costs[1] = (tradeRow.costs[1] || tradeRow.costs[0]) + costs[1];
          }
        });
      }

      return result;
    }, []);
  }

  ngOnInit(): void {
    this.computePrice();
  }

}
