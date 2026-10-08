import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, shareReplay, Subject } from 'rxjs';
import { bufferCount, first, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
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
import { MarketPriceService, PriceCalculationMode, PriceModeOption } from '../../../core/api/market/market-price.service';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-currency-spending',
  templateUrl: './currency-spending.component.html',
  styleUrls: ['./currency-spending.component.less'],
  standalone: true,
  imports: [FlexModule, NzSelectModule, FormsModule, I18nNameComponent, NzInputNumberModule, NzProgressModule, NzTableModule, NzEmptyModule, DbButtonComponent, ItemIconComponent, MarketboardIconComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, FloorPipe, LazyIconPipe, NzDropDownModule, NzMenuModule, NzIconModule]
})
export class CurrencySpendingComponent extends TeamcraftComponent implements OnInit {

  public currencies$: Observable<number[]>;

  public currency$ = new Subject<number>();

  public results$: Observable<SpendingEntry[]>;

  /** Derived results: applies price mode to cached data (no refetch) */
  public priceModeResults$: Observable<SpendingEntry[]>;

  public amount$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

  public servers$: Observable<string[]>;

  public server$: Subject<string> = new Subject<string>();

  public sort$: BehaviorSubject<SortPair> = new BehaviorSubject<SortPair>({
    key: 'exchangeRate',
    value: 'descend'
  });

  public loading = false;

  public tradesCount = 0;

  public loadedPrices = 0;

  /** In-flight Universalis chunk counts per pipeline. Each pipeline's switchMap
      resets its own count on re-key, so requests abandoned by a server/currency/mode
      change can't leak and keep the spinner stuck */
  private pendingChunks = { historical: 0, current: 0 };

  /** The currently selected price calculation mode */
  public priceMode$: BehaviorSubject<PriceCalculationMode> = new BehaviorSubject<PriceCalculationMode>('lowest');

  /** Getter for the current price mode value (for template access) */
  public get priceMode(): PriceCalculationMode {
    return this.priceMode$.value;
  }

  /** Available price mode options for the dropdown */
  public priceModeOptions: PriceModeOption[];

  constructor(private dataService: DataService, private lazyData: LazyDataFacade,
              private authFacade: AuthFacade, private universalis: UniversalisService,
              private marketPriceService: MarketPriceService) {
    super();
    this.priceModeOptions = marketPriceService.getModeOptions();
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

    // relevant items
    const itemInfos$ = combineLatest([this.currency$, this.server$]).pipe(
      switchMap(([currency]) => {
        return combineLatest([
          this.lazyData.getEntry('shops'),
          this.lazyData.getEntry('marketItems'),
        ]).pipe(
          map(([shops, marketItems]) => this.getItemInfos(shops, marketItems, currency))
        );
      }),
      shareReplay(1)
    );
    
    // Historical data: cached per currency/server. Each payload is tagged with
    // the (server, currency) it was fetched for so results$ can detect stale cached values.
    const historicalMarketData$: Observable<MarketData> = combineLatest([this.server$, this.currency$, itemInfos$]).pipe(
      switchMap(([server, currency, items]) => {
        this.tradesCount = items.length;
        this.loadedPrices = 0;
        return this.getMarketboardListings(items, (...itemIds) => this.universalis.getServerHistoryPrices(server, ...itemIds), 'historical')
          .pipe(map(data => ({ server, currency, data })));
      }),
      shareReplay(1)
    );

    // Current prices: only fetched when currentListing is active. The mode check
    // lives inside the switchMap (instead of a filter) so the pipeline still runs
    // on mode changes and can zero its pending count, clearing abandoned requests.
    const currentMarketData$: Observable<MarketData> = combineLatest([this.server$, this.currency$, itemInfos$, this.priceMode$]).pipe(
      switchMap(([server, currency, items, mode]) => {
        if (mode !== 'currentListing') {
          // Drop the stale payload and clear any in-flight current requests
          this.pendingChunks.current = 0;
          this.loading = this.pendingChunks.historical + this.pendingChunks.current > 0;
          return of({ server: null, currency: null, data: [] } as MarketData);
        }
        // Relies on the historical pipeline being declared first: on shared triggers
        // (server/currency) its switchMap resets tradesCount before this one adds to it
        this.tradesCount += items.length;
        return this.getMarketboardListings(items, (...itemIds) => this.universalis.getServerPrices(server, ...itemIds), 'current')
          .pipe(map(data => ({ server, currency, data })));
      }),
      startWith({ server: null, currency: null, data: [] } as MarketData),
      shareReplay(1)
    );

    this.results$ = combineLatest([this.currency$, itemInfos$, historicalMarketData$, currentMarketData$]).pipe(
      switchMap(([currency, items, historical, current]) => {
        // combineLatest keeps the last value of each source: on a server or
        // currency change, the (slower) current-price requests are still in
        // flight, so the cached current payload still belongs to the previous
        // key. Treat it as empty until both tags match the history we have.
        const currentData = (current.server === historical.server && current.currency === historical.currency)
          ? current.data
          : [];
        const historyById = new Map(
          historical.data.map(item => [item.ItemId, item])
        );
        const currentById = new Map(
          currentData.map(item => [item.ItemId, item])
        );
        const mapped = uniqBy(items, 'item').map(item => {
          const hist = historyById.get(item.item);
          const cur = currentById.get(item.item);
          if (!hist && !cur) {
            return null;
          }
          return this.getNpcsSellingItemForCurrency(item.item, currency).pipe(
            map(npcs => <SpendingEntry>{
              ...item,
              HQ: item.HQ,
              itemID: item.item,
              npcs: npcs,
              price: 0, // Computed later based on price mode
              score: 0, // computed later // avgPrice / entry.rate * amountSoldLastWeek,
              rate: item.rate,
              exchangeRate: 0, // computed later // avgPrice * entry.rate,
              // raw prices comes from the current prices, history from historical
              rawPrices: cur?.Prices || [],
              rawHistory: hist?.History || [],
              amountSoldLastWeek: this.marketPriceService.getUnitsSoldLastWeek(hist, item.HQ),
            })
          );
        }).filter(e => e !== null);
        return safeCombineLatest(mapped);
      })
    );

    // Derived observable: enrich with amount, compute price based on mode, and apply sort.
    // When priceMode$ or amount$ changes, this recomputes without a refetch.
    this.priceModeResults$ = combineLatest([this.results$, this.amount$, this.priceMode$, this.sort$]).pipe(
      map(([entries, currencyAmount, priceMode, sort]) => {
        // Keep only entries that have data for the active mode
        const relevant = entries.filter(entry => priceMode === 'currentListing'
          ? entry.rawPrices.length > 0
          : entry.rawHistory.length > 0
        );
        return relevant.map(entry => {
          const amountPurchaseable = Math.floor(entry.rate! * (currencyAmount || 0));
          // History and listings hold both HQ and NQ rows for the same item
          const hq = entry.HQ ?? false;
          const price = priceMode === 'currentListing'
            ? this.marketPriceService.getCurrentListingPrice(entry.rawPrices, hq)
            : this.marketPriceService.calculatePrice(entry.rawHistory, priceMode, hq);
          const exchangeRate = price * entry.rate!;
          return {
            ...entry,
            amount: amountPurchaseable,
            price: price,
            total: amountPurchaseable * price,
            exchangeRate: exchangeRate,
            score: price / entry.rate! * (entry.amountSoldLastWeek ?? 0),
          };
        }).sort((a, b) => {
          const aVal = (a as any)[sort.key] ?? 0;
          const bVal = (b as any)[sort.key] ?? 0;
          if (aVal === bVal) {
            return a.score! > b.score! ? 1 : -1;
          }
          if (sort.value === 'ascend') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      })
    );
  }

  private getItemInfos(shops: LazyShop[], marketItems: number[], currency: number): ItemInfo[] {
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

  private getNpcsSellingItemForCurrency(itemId: number, currency: number): Observable<number[]> {
    return this.lazyData.getRow('extracts', itemId).pipe(
      map(extract => 
        getItemSource(extract!, DataType.TRADE_SOURCES)
          .filter(trade => trade.trades.some(t => t.currencies.some(c => c.id === currency)))
          .map(tradeSource => tradeSource.npcs.filter(npc => !npc.festival).map(npc => npc.id)).flat()
      )
    )
  }

  // Get the universalis market entries for all of the items requested on a server
  private getMarketboardListings(entries: ItemInfo[], method: (...itemIds: number[]) => Observable<MarketboardItem[]>, pipeline: 'historical' | 'current'): Observable<MarketboardItem[]> {
    // Batch items into max items in universalis request
    const batches = chunk(entries, 100)
      .map((chunk) => {
        console.debug(`Requesting chunk of ${chunk.length} items from Universalis`);
        return method(
          ...chunk.map(entry => entry.item)
        );
      });
    // Reset this pipeline's count on re-key: chunks abandoned by a later switchMap
    // never decrement, so the count must not carry over from the previous key
    this.pendingChunks[pipeline] = batches.length;
    this.loading = this.pendingChunks.historical + this.pendingChunks.current > 0;
    // Make sure unviersalis isn't overloaded with requests
    return requestsWithDelay(batches, 250, true).pipe(
      // Update loading count of prices; the spinner stays on until every
      // chunk started by both pipelines has come back
      tap(res => {
        this.loadedPrices = Math.min(this.tradesCount, this.loadedPrices + res.length);
        this.pendingChunks[pipeline] = Math.max(0, this.pendingChunks[pipeline] - 1);
        this.loading = this.pendingChunks.historical + this.pendingChunks.current > 0;
      }),
      bufferCount(batches.length),
      first(),
      map(res => {
        return res.flat()
          // make sure the item has data
          .filter(mbRow => {
            return mbRow.History && mbRow.History.length > 0 || mbRow.Prices && mbRow.Prices.length > 0;
          });
    }));
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

  setPriceMode(mode: PriceCalculationMode): void {
    this.priceMode$.next(mode);
  }

  /** The label key for the currently selected price mode */
  get currentPriceModeLabelKey(): string {
    return this.priceModeOptions.find(m => m.key === this.priceMode)?.labelKey ?? '';
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

/** Marketboard data tagged with the (server, currency) it was fetched for */
type MarketData = {
  server: string | null;
  currency: number | null;
  data: MarketboardItem[];
}