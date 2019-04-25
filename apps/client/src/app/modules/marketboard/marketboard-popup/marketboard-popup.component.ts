import { Component, Input, OnInit } from '@angular/core';
import { XivapiService } from '@xivapi/angular-client';
import { AuthFacade } from '../../../+state/auth.facade';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MarketboardItem } from '@xivapi/angular-client/src/model/schema/market/marketboard-item';

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

  prices$: Observable<any[]>;

  history$: Observable<any[]>;

  loading = true;

  loadingHistory = true;

  server$: Observable<string>;

  error = false;

  sort$: BehaviorSubject<{ key: string, value: 'ascend' | 'descend' }> = new BehaviorSubject<{ key: string, value: any }>({
    key: 'PricePerUnit',
    value: 'ascend'
  });

  constructor(private authFacade: AuthFacade, private xivapi: XivapiService, private lazyData: LazyDataService) {
  }

  ngOnInit() {
    this.server$ = this.authFacade.mainCharacter$.pipe(
      map(character => character.Server),
      shareReplay(1)
    );

    const data$: Observable<MarketboardItem> = this.server$.pipe(
      switchMap(server => {
        return this.xivapi.getMarketBoardItemCrossServer(Object.keys(this.lazyData.datacenters).find(dc => {
          return this.lazyData.datacenters[dc].indexOf(server) > -1;
        }), this.itemId);
      }),
      map(res => {
        const item: Partial<MarketboardItem> = {
          ID: res[Object.keys(res)[0]].ID,
          ItemId: res[Object.keys(res)[0]].ItemId,
          History: [],
          Prices: []
        };
        item.Prices = [].concat.apply([], Object.keys(res).map(serverName => {
          return res[serverName].Prices.map(price => {
            (<any>price).Server = serverName;
            return price;
          });
        }));
        item.History = [].concat.apply([], Object.keys(res).map(serverName => {
          return res[serverName].History.map(historyRow => {
            (<any>historyRow).Server = serverName;
            return historyRow;
          });
        }));
        return item as MarketboardItem;
      })
    );

    this.prices$ = combineLatest(data$
        .pipe(
          map(item => item.Prices),
          tap(() => this.loading = false),
          catchError((err) => {
            console.error(err);
            this.error = true;
            return of([]);
          }),
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

    this.history$ = data$.pipe(
      map(item => item.History),
      catchError((err) => {
        console.error(err);
        this.error = true;
        return of([]);
      }),
      tap(() => this.loadingHistory = false),
      map(history => {
        return history.map(entry => {
          return {
            ...entry,
            PurchaseDate: entry.PurchaseDate + '000'
          };
        });
      }),
      shareReplay(1)
    );
  }

  sort(event: any): void {
    this.sort$.next({ key: event.key, value: event.value });
  }

}
