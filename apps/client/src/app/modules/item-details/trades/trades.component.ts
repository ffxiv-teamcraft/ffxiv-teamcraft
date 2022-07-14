import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { TradeSource } from '../../list/model/trade-source';
import { Trade } from '../../list/model/trade';
import { TradeEntry } from '../../list/model/trade-entry';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesComponent extends ItemDetailsPopup implements OnChanges {

  private tradeSourcesData$ = new ReplaySubject<TradeSource[]>();

  public isExternalTrades$ = new BehaviorSubject<boolean>(false);

  @Input()
  set externalTradeSources(ts: TradeSource[]) {
    this.tradeSourcesData$.next(ts);
    this.isExternalTrades$.next(true);
  }

  @Input()
  public dbDisplay = false;

  public displayedTrades$ = new BehaviorSubject<number>(5);

  public tradeSources$: Observable<TradeSource[]> = combineLatest([
    this.tradeSourcesData$,
    this.displayedTrades$
  ]).pipe(
    map(([data, displayed]) => {
      return data.slice(0, displayed);
    })
  );

  public hasMoreAvailable$ = combineLatest([
    this.tradeSourcesData$,
    this.displayedTrades$
  ]).pipe(
    map(([data, displayed]) => data.length > displayed)
  );

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

  public showMore(): void {
    this.displayedTrades$.next(this.displayedTrades$.value + 5);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.details && changes.details.currentValue.length > 0) {
      this.tradeSourcesData$.next(changes.details.currentValue);
      this.isExternalTrades$.next(false);
    }
  }

}
