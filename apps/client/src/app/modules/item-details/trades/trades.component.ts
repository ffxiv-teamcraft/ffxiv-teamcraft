import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { TradeSource } from '../../list/model/trade-source';
import { Trade } from '../../list/model/trade';
import { TradeEntry } from '../../list/model/trade-entry';
import { BehaviorSubject, combineLatest, merge, Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { MapPositionComponent } from '../../map/map-position/map-position.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-trades',
    templateUrl: './trades.component.html',
    styleUrls: ['./trades.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgFor, NzCardModule, NzGridModule, ItemIconComponent, NgIf, NzButtonModule, NzIconModule, NzListModule, DbButtonComponent, MapPositionComponent, NzWaveModule, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, ClosestAetherytePipe]
})
export class TradesComponent extends ItemDetailsPopup implements OnChanges {

  private externalSources$ = new ReplaySubject<TradeSource[]>();

  public isExternalTrades$ = new BehaviorSubject<boolean>(false);

  @Input()
  set externalTradeSources(ts: TradeSource[]) {
    this.externalSources$.next(ts);
    this.isExternalTrades$.next(true);
  }

  @Input()
  public dbDisplay = false;

  public displayedTrades$ = new BehaviorSubject<number>(5);

  public tradeSourcesData$ = merge(this.externalSources$, this.details$.pipe(filter(d => d !== undefined)));

  public tradeSources$: Observable<TradeSource[]> = combineLatest([
    this.tradeSourcesData$,
    this.displayedTrades$
  ]).pipe(
    map(([data, displayed]) => {
      return (data || []).slice(0, displayed);
    })
  );

  public hasMoreAvailable$ = combineLatest([
    this.tradeSourcesData$,
    this.displayedTrades$
  ]).pipe(
    map(([data, displayed]) => {
      return (data?.length || 0) > displayed;
    })
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
      this.isExternalTrades$.next(false);
    }
  }

}
