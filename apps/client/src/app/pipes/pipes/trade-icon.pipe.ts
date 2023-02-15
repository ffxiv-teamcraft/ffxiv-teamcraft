import { Pipe, PipeTransform } from '@angular/core';
import { TRADE_SOURCES_PRIORITIES } from '@ffxiv-teamcraft/types';
import { TradeSource } from '../../modules/list/model/trade-source';

@Pipe({
  name: 'tradeIcon',
  pure: true
})
export class TradeIconPipe implements PipeTransform {

  public static getIcon(tradeSources: TradeSource[]): number {
    const res: any = { priority: 0, id: 0 };
    tradeSources.forEach(ts => {
      ts.trades.forEach(trade => {
        trade.currencies.forEach(currency => {
          const id = currency.id;
          if (TRADE_SOURCES_PRIORITIES[id] !== undefined &&
            TRADE_SOURCES_PRIORITIES[id] > res.priority) {
            res.id = currency.id;
            res.priority = TRADE_SOURCES_PRIORITIES[id];
          }
        });
      });
    });
    return res.id;
  }

  transform(tradeSources: TradeSource[]): number {
    return TradeIconPipe.getIcon(tradeSources);
  }

}
