import { Component } from '@angular/core';
import { SearchIndex, XivapiService } from '@xivapi/angular-client';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SpendingEntry } from '../spending-entry';
import { DataService } from '../../../core/api/data.service';
import { ItemData } from '../../../model/garland-tools/item-data';
import * as _ from 'lodash';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { UniversalisService } from '../../../core/api/universalis.service';

@Component({
  selector: 'app-currency-spending',
  templateUrl: './currency-spending.component.html',
  styleUrls: ['./currency-spending.component.less']
})
export class CurrencySpendingComponent extends TeamcraftComponent {

  public currencies$: Observable<any>;

  public currency$ = new Subject<number>();

  public results$: Observable<SpendingEntry[]>;

  public amount$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public servers$: Observable<string[]>;

  public server$: Subject<string> = new Subject<string>();

  public loading = false;

  constructor(private xivapi: XivapiService, private dataService: DataService,
              private authFacade: AuthFacade, private universalis: UniversalisService) {
    super();
    this.servers$ = this.xivapi.getServerList().pipe(
      map(servers => {
        return servers.sort();
      })
    );

    this.authFacade.loggedIn$.pipe(
      switchMap(loggedIn => {
        if (loggedIn) {
          return this.authFacade.mainCharacter$.pipe(
            map(character => character.Server)
          );
        } else {
          return of(null);
        }
      }),
      takeUntil(this.onDestroy$)
    ).subscribe(server => {
      if (server !== null) {
        this.server$.next(server);
      }
    });

    this.currencies$ = this.xivapi.search({
      indexes: [SearchIndex.ITEM],
      filters: [
        {
          column: 'IconID',
          operator: '>=',
          value: 65000
        },
        {
          column: 'IconID',
          operator: '<',
          value: 66000
        }
      ]
    }).pipe(
      map(res => {
        return res.Results.filter(item => {
          // Remove gil, venture and outdated tomes/scrips
          return [1, 23, 24, 26, 30, 31, 32, 33, 34, 35, 10308, 10310, 21072].indexOf(item.ID) === -1;
        });
      })
    );

    this.results$ = combineLatest([this.currency$, this.server$]).pipe(
      switchMap(([currency, server]) => {
        this.loading = true;
        return this.dataService.getItem(currency).pipe(
          map((item: ItemData) => {
            return [].concat.apply([], item.item.tradeCurrency.map(entry => {
              return entry.listings.map(listing => {
                const currencyEntry = listing.currency.find(c => +c.id === currency);
                return {
                  npcs: entry.npcs,
                  item: +listing.item[0].id,
                  HQ: listing.item[0].hq === 1,
                  rate: listing.item[0].amount / currencyEntry.amount
                };
              });
            }));
          }),
          switchMap(entries => {
            const batches = _.chunk(entries, 100)
              .map((chunk: any) => {
                return this.universalis.getServerPrices(
                  server,
                  ...chunk.map(entry => entry.item)
                );
              });
            return requestsWithDelay(batches, 250).pipe(
              map(res => {
                return [].concat.apply([], res)
                  .filter(mbRow => {
                    return mbRow.History && mbRow.History.length > 0 || mbRow.Prices && mbRow.Prices.length > 0;
                  });
              }),
              map((res) => {
                return entries
                  .filter(entry => {
                    return res.some(r => r.ItemId === entry.item);
                  })
                  .map(entry => {
                    const mbRow = res.find(r => r.ItemId === entry.item);
                    let prices = (mbRow.Prices || [])
                      .filter(item => item.IsHQ === (entry.HQ || false));
                    if (prices.length === 0) {
                      prices = (mbRow.History || [])
                        .filter(item => item.IsHQ === (entry.HQ || false));
                    }
                    const price = prices
                      .sort((a, b) => a.PricePerUnit - b.PricePerUnit)[0];
                    return <SpendingEntry>{
                      ...entry,
                      price: price && price.PricePerUnit
                    };
                  })
                  .filter(entry => entry.price)
                  .sort((a, b) => {
                    const priceDiff = b.price - a.price;
                    if (priceDiff === 0) {
                      return b.rate - a.rate;
                    }
                    return priceDiff;
                  });
              })
            );
          })
        );
      }),
      tap(() => this.loading = false)
    );
  }

}
