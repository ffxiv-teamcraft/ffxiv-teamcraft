import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { TradeEntry } from '../../../../modules/list/model/trade-entry';
import { Trade } from '../../../../modules/list/model/trade';
import { TradeSource } from '../../../../modules/list/model/trade-source';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesComponent extends ItemDetailsPopup {

  @Input()
  public externalTradeSources: TradeSource[] = [];

  @Input()
  public dbDisplay = false;

  public get tradeSources(): TradeSource[] {
    if (this.externalTradeSources.length === 0) {
      return this.item.tradeSources;
    }
    return this.externalTradeSources;
  }

  public get fromExternalTrades(): boolean {
    return this.externalTradeSources.length > 0;
  }

  constructor() {
    super();
  }

  public totalPrice(trade: Trade): TradeEntry[] {
    const itemsPerTrade = trade.items.find(item => item.id === this.item.id).amount;
    return trade.currencies.map(currency => {
      return {
        ...currency,
        amount: Math.ceil(currency.amount * (this.item.amount - this.item.done) / itemsPerTrade)
      };
    });
  }

}
