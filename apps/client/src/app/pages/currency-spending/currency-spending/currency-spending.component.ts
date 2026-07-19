import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { bufferCount, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SpendingEntry } from '../spending-entry';
import { DataService } from '../../../core/api/data.service';
import { chunk, uniqBy } from 'lodash';
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { UniversalisService } from '../../../core/api/universalis.service';
import { DataType, getItemSource, SearchType } from '@ffxiv-teamcraft/types';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { FloorPipe } from '../../../pipes/pipes/floor.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MarketboardIconComponent } from '../../../modules/marketboard/marketboard-icon/marketboard-icon.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FlexModule } from '@angular/flex-layout/flex';
import { LazyShop } from '@ffxiv-teamcraft/data/model/lazy-shop';
import { MarketboardItem } from '../../../core/api/market/marketboard-item';

@Component({
  selector: 'app-currency-spending',
  templateUrl: './currency-spending.component.html',
  styleUrls: ['./currency-spending.component.less'],
  standalone: true,
  imports: [FlexModule, NzSelectModule, FormsModule, I18nNameComponent, NzInputNumberModule, NzProgressModule, NzTableModule, NzEmptyModule, DbButtonComponent, ItemIconComponent, MarketboardIconComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, FloorPipe, LazyIconPipe]
})
export class CurrencySpendingComponent extends TeamcraftComponent implements OnInit {

  public currencies$: Observable<number[]>;

  public currency$ = new Subject<number>();

  public results$: Observable<SpendingEntry[]>;

  public amount$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

  public servers$: Observable<string[]>;

  public server$: Subject<string> = new Subject<string>();

  public sort$: BehaviorSubject<SortPair> = new BehaviorSubject<SortPair>({
    key: 'score',
    value: 'ascend'
  });

  public loading = false;

  public tradesCount = 0;

  public loadedPrices = 0;

  constructor(private dataService: DataService, private lazyData: LazyDataFacade,
              private authFacade: AuthFacade, private universalis: UniversalisService) {
    super();
    this.servers$ = lazyData.servers$.pipe(
      map(servers => {
        return servers.sort();
      })
    );

    this.currencies$ = this.dataService.search('', SearchType.ITEM, [
      {
        name: 'iconId',
        minMax: true,
        value: { min: 65000, max: 66000 }
      }
    ]).pipe(
      map(res => {
        return [
          ...res.filter(item => {
            // Remove gil, venture and outdated tomes/scrips
            return [1, 23, 24, 26,29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 10308, 10309, 10310, 10311, 21072].indexOf(+item.itemId) === -1;
          }).map(item => item.itemId as number),
          33870,
          15857,
          15858,
          38533, // Sil'dihn Potsherd
          39884, // Rokkon Potsherd
          41078 // Aloalo Potsherd
        ];
      })
    );

    this.results$ = combineLatest([this.currency$, this.server$]).pipe(
      switchMap(([currency, server]) => {
        this.loading = true;
        const spendingEntries = combineLatest([
          this.lazyData.getEntry('shops'),
          this.lazyData.getEntry('marketItems'),
        ]).pipe(
          map(([shops, marketItems]) => this.getItemInfos(shops, marketItems, currency)),
          switchMap(entries => this.processMarketData(entries, server, currency))
        );

        // Extend spending entries with amount information, don't trigger universalis requests
        const extendedSpendingEntries = combineLatest([spendingEntries, this.amount$]).pipe(
          map(([entries, currencyAmount]) => this.computeValueWithAmount(entries, currencyAmount))
        )

        // Sort with full entries
        return combineLatest([extendedSpendingEntries, this.sort$]).pipe(
          map(([data, sort]) => [...data].sort((a, b) => {
            if (sort.value === 'ascend') {
              if (a[sort.key] === b[sort.key]) {
                return a.score! > b.score! ? 1 : -1;
              }
              return a[sort.key] > b[sort.key] ? 1 : -1;
            } else {
              if (a[sort.key] === b[sort.key]) {
                return a.score! > b.score! ? 1 : -1;
              }
              return a[sort.key] < b[sort.key] ? 1 : -1;
            }
          }))
        );
      }),
      tap(() => {
        this.loading = false;
        this.tradesCount = 0;
        this.loadedPrices = 0;
      })
    );

    // Default to sorting by Gil / currency
    this.sort$.next({key: 'exchangeRate', value: 'descend'})
  }

  getItemInfos(shops: LazyShop[], marketItems: number[], currency: number): ItemInfo[] {
    return shops
      .filter(shop => {
        return shop.trades.some(t => {
          return t.currencies.some(c => c.id === currency)
            && t.items.some(i => marketItems.includes(i.id));
        });
      })
      .map(shop => {
        return shop.trades
          .filter(t => t.items.length > 0 && t.currencies.some(c => c.id === currency))
          .map(t => {
            const currencyEntry = t.currencies.find(c => c.id === currency)!;
            return {
              npcs: shop.npcs,
              item: +t.items[0].id,
              HQ: t.items[0].hq || false,
              rate: +t.items[0].amount / currencyEntry.amount
            };
          });
      })
      .flat();
  }

  processMarketData(entries: ItemInfo[], server: string, currency: number) {
    if (entries.length === 0) {
      return of([]);
    }
    this.tradesCount = entries.length;
    return this.getMarketboardListings(entries, server).pipe(
      switchMap((res) => {
        return safeCombineLatest(entries
          .filter(entry => {
            return res.some(r => r.ItemId === entry.item);
          })
          .map(entry => {
            return this.lazyData.getRow('extracts', entry.item).pipe(
              map(extract => {
                const mbRow = res.find(r => r.ItemId === entry.item)!;
                const avgPrice = mbRow.History.reduce((prev, curr) => {
                  return prev.PricePerUnit < curr.PricePerUnit ? prev : curr;
                }).PricePerUnit;
                const amountSoldLastWeek = Math.floor(mbRow.nqSaleVelocity * 7);
                const exchangeRate = avgPrice * entry.rate;
                return <SpendingEntry>{
                  ...entry,
                  HQ: entry.HQ,
                  itemID: entry.item,
                  npcs: getItemSource(extract!, DataType.TRADE_SOURCES)
                    .filter(trade => trade.trades.some(t => t.currencies.some(c => c.id === currency)))
                    .map(tradeSource => tradeSource.npcs.filter(npc => !npc.festival).map(npc => npc.id)).flat(),
                  price: avgPrice,
                  score: avgPrice / entry.rate * amountSoldLastWeek,
                  amountSoldLastWeek: amountSoldLastWeek,
                  exchangeRate: exchangeRate
                };
              })
            );
          })
        );
      }),
      map((res: SpendingEntry[]) => {
        return uniqBy(res.filter(entry => entry.price), 'itemID');
      })
    );
  }

  // Get the universalis market entries for all of the items requested on a server
  getMarketboardListings(entries: ItemInfo[], server: string): Observable<MarketboardItem[]> {
    // Batch items into max items in universalis request
    const batches = chunk(entries, 100)
      .map((chunk) => {
        return this.universalis.getServerHistoryPrices(
          server,
          ...chunk.map(entry => entry.item)
        );
      });
    this.tradesCount = entries.length;
    // Make sure unviersalis isn't overloaded with requests
    return requestsWithDelay(batches, 250, true).pipe(
      // Update loading count of prices
      tap(res => {
        this.loadedPrices = Math.min(this.tradesCount, this.loadedPrices + res.length);
      }),
      bufferCount(batches.length),
      first(),
      map(res => {
        return res.flat()
          // make sure the item has been sold
          .filter(mbRow => {
            return mbRow.History && mbRow.History.length > 0 || mbRow.Prices && mbRow.Prices.length > 0;
          });
    }));
  }

  computeValueWithAmount(entries: SpendingEntry[], currencyAmount: number | null): SpendingEntry[] {
    return entries.map((entry) => {
      // If null, assume no currency
      currencyAmount = currencyAmount || 0;
      const amountPurchaseable = Math.floor(entry.rate! * currencyAmount)
      const totalValue = amountPurchaseable * entry.price;
      return {
        ...entry,
        amount: amountPurchaseable,
        total: totalValue
      };
    });
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

  sort(event: any): void {
    this.sort$.next({ key: event.key, value: event.value });
  }

}

type SortPair = {
  key: keyof SpendingEntry,
  value: 'ascend' | 'descend'
}

type ItemInfo = {
  npcs: number[];
  item: number;
  HQ: boolean;
  rate: number;
}