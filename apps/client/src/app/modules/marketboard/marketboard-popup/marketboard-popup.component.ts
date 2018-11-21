import { Component, Input, OnInit } from '@angular/core';
import { XivapiService } from '@xivapi/angular-client';
import { AuthFacade } from '../../../+state/auth.facade';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { MarketboardPrice } from '@xivapi/angular-client/src/model/schema/market/marketboard-price';
import { MarketboardItemHistory } from '@xivapi/angular-client/src/model/schema/market/marketboard-item-history';

@Component({
  selector: 'app-marketboard-popup',
  templateUrl: './marketboard-popup.component.html',
  styleUrls: ['./marketboard-popup.component.less']
})
export class MarketboardPopupComponent implements OnInit {

  @Input()
  itemId: number;

  @Input()
  showHistory = false;

  prices$: Observable<MarketboardPrice[]>;

  history$: Observable<any[]>;

  loading = true;

  loadingHistory = true;

  sort$: BehaviorSubject<{ key: string, value: 'ascend' | 'descend' }> = new BehaviorSubject<{ key: string, value: any }>({
    key: 'PricePerUnit',
    value: 'ascend'
  });

  constructor(private authFacade: AuthFacade, private xivapi: XivapiService) {
  }

  ngOnInit() {
    const server$ = this.authFacade.mainCharacter$.pipe(
      map(character => character.Server),
      shareReplay(1)
    );

    this.prices$ = combineLatest(server$
        .pipe(
          switchMap(server => {
            return this.xivapi.getMarketBoardItem(server, this.itemId);
          }),
          map(item => item.Prices),
          tap(() => this.loading = false),
          shareReplay(1)
        ),
      this.sort$
    ).pipe(
      map(([prices, sort]) => {
        return [...prices.sort((a, b) => {
          if (sort.value === 'ascend') {
            if (a[sort.key] === b[sort.key]) {
              return a.PricePerUnit > b.PricePerUnit ? 1 : -1;
            }
            return a[sort.key] > b[sort.key] ? 1 : -1;
          } else {
            if (a[sort.key] === b[sort.key]) {
              return a.PricePerUnit > b.PricePerUnit ? 1 : -1;
            }
            return a[sort.key] < b[sort.key] ? 1 : -1;
          }
        })];
      })
    );

    this.history$ = server$.pipe(
      switchMap(server => {
        return this.xivapi.getMarketBoardItemHistory(server, this.itemId);
      }),
      map(itemHistory => itemHistory.History),
      tap(() => this.loadingHistory = false),
      map(history => {
        return history.map(entry => {
          return {
            ...entry,
            PurchaseDate: entry.PurchaseDate + '000'
          }
        })
      }),
      shareReplay(1)
    );
  }

  sort(event: any): void {
    this.sort$.next({ key: event.key, value: event.value });
  }

}
