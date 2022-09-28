import { Component, OnInit } from '@angular/core';
import { SearchIndex, XivapiService } from '@xivapi/angular-client';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { bufferCount, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SpendingEntry } from '../spending-entry';
import { DataService } from '../../../core/api/data.service';
import * as _ from 'lodash';
import { uniqBy } from 'lodash';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { UniversalisService } from '../../../core/api/universalis.service';
import { getItemSource } from '../../../modules/list/model/list-row';
import { DataType } from '../../../modules/list/data/data-type';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-currency-spending',
  templateUrl: './currency-spending.component.html',
  styleUrls: ['./currency-spending.component.less']
})
export class CurrencySpendingComponent extends TeamcraftComponent implements OnInit {

  public currencies$: Observable<number[]>;

  public currency$ = new Subject<number>();

  public results$: Observable<SpendingEntry[]>;

  public amount$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public servers$: Observable<string[]>;

  public server$: Subject<string> = new Subject<string>();

  public loading = false;

  public tradesCount = 0;

  public loadedPrices = 0;

  constructor(private xivapi: XivapiService, private dataService: DataService,
              private authFacade: AuthFacade, private universalis: UniversalisService,
              private lazyData: LazyDataFacade) {
    super();
    this.servers$ = this.xivapi.getServerList().pipe(
      map(servers => {
        return servers.sort();
      })
    );

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
        return [
          ...res.Results.filter(item => {
            // Remove gil, venture and outdated tomes/scrips
            return [1, 23, 24, 26, 30, 31, 32, 33, 34, 35, 36, 37, 38, 10308, 10309, 10310, 10311, 21072].indexOf(item.ID) === -1;
          }).map(item => item.ID as number),
          33870,
          15857,
          15858
        ];
      })
    );

    this.results$ = combineLatest([this.currency$, this.server$]).pipe(
      switchMap(([currency, server]) => {
        this.loading = true;
        return combineLatest([
          this.lazyData.getEntry('shops'),
          this.lazyData.getEntry('marketItems')
        ]).pipe(
          map(([shops, marketItems]) => {
            return shops
              .filter(shop => {
                return shop.trades.some(t => {
                  return t.currencies.some(c => c.id === currency)
                    && t.items.some(i => marketItems.includes(i.id));
                }) && shop.npcs.length > 0;
              })
              .map(shop => {
                return shop.trades
                  .filter(t => t.items.length > 0 && t.currencies.some(c => c.id === currency))
                  .map(t => {
                    const currencyEntry = t.currencies.find(c => +c.id === currency);
                    return {
                      npcs: shop.npcs,
                      item: +t.items[0].id,
                      HQ: +t.items[0].hq,
                      rate: +t.items[0].amount / currencyEntry.amount
                    };
                  });
              })
              .flat();
          }),
          switchMap(entries => {
            if (entries.length === 0) {
              return of([]);
            }
            const batches = _.chunk(entries, 100)
              .map((chunk: any) => {
                return this.universalis.getServerHistoryPrices(
                  server,
                  5,
                  ...chunk.map(entry => entry.item)
                );
              });
            this.tradesCount = entries.length;
            return requestsWithDelay(batches, 250, true).pipe(
              tap(res => {
                this.loadedPrices = Math.min(this.tradesCount, this.loadedPrices + res.length);
              }),
              bufferCount(batches.length),
              first(),
              map(res => {
                return [].concat.apply([], res)
                  .filter(mbRow => {
                    return mbRow.History && mbRow.History.length > 0 || mbRow.Prices && mbRow.Prices.length > 0;
                  });
              }),
              switchMap((res) => {
                return safeCombineLatest(entries
                  .filter(entry => {
                    return res.some(r => r.ItemId === entry.item);
                  })
                  .map(entry => {
                    return this.lazyData.getRow('extracts', entry.item).pipe(
                      map(extract => {
                        const mbRow = res.find(r => r.ItemId === entry.item);
                        const avgPrice = mbRow.History.reduce((prev, curr) => {
                          return prev.pricePerUnit < curr.pricePerUnit ? prev : curr;
                        }).pricePerUnit;
                        const amountSoldLastWeek = Math.floor(mbRow.regularSaleVelocity * 7);
                        return <SpendingEntry>{
                          ...entry,
                          HQ: entry.HQ === 1,
                          itemID: entry.item,
                          npcs: getItemSource(extract, DataType.TRADE_SOURCES)
                            .filter(trade => trade.trades.some(t => t.currencies.some(c => c.id === currency)))
                            .map(tradeSource => tradeSource.npcs.filter(npc => !npc.festival).map(npc => npc.id)).flat(),
                          price: avgPrice,
                          score: avgPrice / entry.rate * amountSoldLastWeek,
                          amountSoldLastWeek
                        };
                      })
                    );
                  })
                );
              }),
              map((res: SpendingEntry[]) => {
                return uniqBy(res.filter(entry => entry.price), 'itemID')
                  .sort((a, b) => {
                    return b.score - a.score;
                  });
              })
            );
          })
        );
      }),
      tap(() => {
        this.loading = false;
        this.tradesCount = 0;
        this.loadedPrices = 0;
      })
    );
  }

  ngOnInit(): void {
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
      takeUntil(this.onDestroy$),
      first()
    ).subscribe(server => {
      if (server !== null) {
        this.server$.next(server);
      }
    });
  }

}
