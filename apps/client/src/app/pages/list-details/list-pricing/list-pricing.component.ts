import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListPricingService } from './list-pricing.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { filter, first, map, mergeMap, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { ListController } from '../../../modules/list/list-controller';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, interval, Observable, Subject } from 'rxjs';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { DataType } from '../../../modules/list/data/data-type';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UniversalisService } from '../../../core/api/universalis.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FullPricingRow } from './model/full-pricing-row';
import { Price } from './model/price';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

@Component({
  selector: 'app-list-pricing',
  templateUrl: './list-pricing.component.html',
  styleUrls: ['./list-pricing.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPricingComponent extends TeamcraftComponent {

  pricingData$ = this.listsFacade.selectedList$.pipe(
    first(),
    switchMap(list => {
      return this.pricingService.getPricingForList(list.$key);
    })
  );

  flatDiscount$ = new BehaviorSubject(0);

  percentDiscount$ = new BehaviorSubject(0);

  selectedListName$ = this.listsFacade.selectedList$.pipe(
    map(list => list.name)
  );

  list$ = this.listsFacade.selectedList$.pipe(
    first()
  );

  listKey$ = this.listsFacade.selectedListKey$;

  display$ = this.listsFacade.selectedList$.pipe(
    switchMap((list) => this.layoutsFacade.getDisplay(list, false)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  finalItemsRow$ = this.listsFacade.selectedList$.pipe(
    switchMap((list) => this.layoutsFacade.getFinalItemsDisplay(list, false)),
    first()
  );

  crystals$ = this.listsFacade.selectedList$.pipe(
    map(list => ListController.getCrystals(list).sort((a, b) => a.id - b.id)),
    first()
  );

  spendingTotal$ = combineLatest([
    this.listsFacade.selectedList$,
    this.pricingData$,
    this.settings.watchSetting('pricing:expect-sell-all', false)
  ]).pipe(
    map(([list, data]) => {
      return list.finalItems
        .filter(row => data.find(pRow => pRow.array === 'finalItems' && pRow.id === row.id)?.use)
        .reduce((acc, row) => {
          const craft = getItemSource(row, DataType.CRAFTED_BY)[0];
          if (!craft) {
            return acc;
          }
          const pricingRow = data.find(pRow => pRow.array === 'finalItems' && pRow.id === row.id);
          const priceToCraft = this.pricingService.getCraftingPrice(row, data);
          return acc + priceToCraft.nq * (pricingRow.amount.nq + pricingRow.amount.hq);
        }, 0);
    })
  );

  earningTotal$ = combineLatest([
    this.listsFacade.selectedList$,
    this.pricingData$,
    this.settings.watchSetting('pricing:ignore-completed-items', false),
    this.flatDiscount$,
    this.percentDiscount$
  ]).pipe(
    map(([list, data, ignoreCompleted, flatDiscount, percentDiscount]) => {
      const total = list.finalItems
        .filter(row => {
          return (!ignoreCompleted || row.done < row.amount) && data.find(pRow => {
            return pRow.array === 'finalItems'
              && pRow.id === row.id;
          })?.use;
        })
        .reduce((acc, row) => {
          const pricingRow = data.find(pRow => pRow.array === 'finalItems' && pRow.id === row.id);
          return acc + pricingRow.price.nq * pricingRow.amount.nq + pricingRow.price.hq * pricingRow.amount.hq;
        }, 0);
      return (total - flatDiscount) * (1 - percentDiscount / 100);
    })
  );

  benefits$ = combineLatest([
    this.earningTotal$,
    this.spendingTotal$
  ]).pipe(
    map(([earning, spending]) => earning - spending)
  );

  loggedIn$ = this.authFacade.loggedIn$;

  private server$: Observable<string> = this.authFacade.mainCharacter$.pipe(
    map(char => char.Server)
  );

  constructor(private pricingService: ListPricingService, private listsFacade: ListsFacade,
              private activatedRoute: ActivatedRoute, private layoutsFacade: LayoutsFacade,
              public translate: TranslateService, private authFacade: AuthFacade,
              private dialog: NzModalService, private universalis: UniversalisService,
              private lazyData: LazyDataFacade, public settings: SettingsService,
              private progressService: ProgressPopupService, private i18n: I18nToolsService) {
    super();
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('listId')),
        tap((listId: string) => this.listsFacade.load(listId)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(listId => {
        this.listsFacade.select(listId);
      });
  }

  public getEarningText = (rows: FullPricingRow[], totalEarnings: number) => {
    return safeCombineLatest(rows.filter(row => row.use !== false).map(row => {
      return this.i18n.getNameObservable('items', row.id).pipe(
        map(itemName => ({ row, itemName }))
      );
    })).pipe(
      map(rowsWithName => {
        return rowsWithName.reduce((total, { row, itemName }) => {
          const price = row.price;
          const amount = row.amount;
          let priceString: string;
          if (price.hq > 0 && amount.hq > 0) {
            priceString = `${price.hq.toLocaleString()}gil x${amount.hq}(HQ)`;
            if (price.nq > 0 && amount.nq > 0) {
              priceString += `, ${price.nq.toLocaleString()}gil x${amount.nq}(NQ)`;
            }
          } else {
            priceString = `${price.nq}gil x${amount.nq}(NQ)`;
          }
          return `${total}\n ${itemName}: ${priceString}`;
        }, `${this.translate.instant('COMMON.Total')}: ${totalEarnings.toLocaleString()}gil\n`);
      })
    );
  };

  public getSpendingText = (rows: FullPricingRow[], totalSpendings: number) => {
    return safeCombineLatest(rows.filter(row => row.use).map(row => {
      return this.i18n.getNameObservable('items', row.id).pipe(
        map(itemName => ({ row, itemName }))
      );
    })).pipe(
      map(rowsWithName => {
        return rowsWithName
          .reduce((total, { row, itemName }) => {
            const price = row.price;
            const amount = row.amount;
            let priceString: string;
            if (price.hq > 0 && amount.hq > 0) {
              priceString = `${price.hq.toLocaleString()}gil x${amount.hq}(HQ) (${this.getWorldName(price.hqServer)})`;
              if (price.nq > 0 || amount.nq > 0) {
                priceString += `, ${price.nq.toLocaleString()}gil x${amount.nq}(NQ) (${this.getWorldName(price.nqServer)})`;
              }
            } else {
              priceString = `${price.nq}gil x${amount.nq}(NQ) (${this.getWorldName(price.nqServer)})`;
            }
            return `${total}\n ${itemName}: ${priceString}`;
          }, `${this.translate.instant('COMMON.Total')}: ${totalSpendings.toLocaleString()}gil\n`);
      })
    );
  };

  public fillMbCosts(listId: string, rows: ListRow[], currentPrices: FullPricingRow[], forceOnlyServer = false, finalItems = false): void {
    const stopInterval$ = new Subject<void>();
    const rowsToFill = rows.filter(row => {
      const priceRow = currentPrices.find(p => p.id === row.id);
      return priceRow?.custom;
    });
    if (rowsToFill.length === 0) {
      return;
    }
    const operations = interval(250).pipe(
      takeUntil(stopInterval$),
      filter(index => rowsToFill[index] !== undefined),
      mergeMap(index => {
        const row = rowsToFill[index];
        return this.server$.pipe(
          first(),
          switchMap(server => {
            return this.lazyData.datacenters$.pipe(
              first(),
              map(datacenters => {
                const dc = Object.keys(datacenters).find(key => {
                  return datacenters[key].indexOf(server) > -1;
                });
                return { server, dc };
              })
            );
          }),
          mergeMap(({ server, dc }) => {
            let prices$;
            if (forceOnlyServer || (!finalItems && this.settings.disableCrossWorld)) {
              prices$ = this.universalis.getServerPrices(server, row.id).pipe(
                map(prices => {
                  return prices.map(price => {
                    return {
                      ...price,
                      Server: server
                    };
                  });
                })
              );
            } else {
              prices$ = this.universalis.getDCPrices(dc, row.id);
            }
            return prices$.pipe(
              first(),
              map(res => {
                const item = res[0];
                const prices = item.Prices;
                const cheapestHq = prices.filter(p => p.IsHQ)
                  .sort((a, b) => a.PricePerUnit - b.PricePerUnit)[0];
                const cheapestNq = prices.filter(p => !p.IsHQ)
                  .sort((a, b) => a.PricePerUnit - b.PricePerUnit)[0];
                const pricingEntry = currentPrices.find(p => p.id === row.id && p.array === (finalItems ? 'finalItems' : 'items'));
                pricingEntry.price = {
                  nq: cheapestNq ? cheapestNq.PricePerUnit : pricingEntry.price.nq,
                  nqServer: cheapestNq ? ((<any>cheapestNq).Server || item.Server) : null,
                  hq: cheapestHq ? cheapestHq.PricePerUnit : pricingEntry.price.hq,
                  hqServer: cheapestHq ? ((<any>cheapestHq).Server || item.Server) : null,
                  updated: item.Updated,
                  fromMB: (cheapestNq || cheapestHq) !== undefined,
                  fromVendor: false
                } as Price;
                return { id: row.id, pricingEntry };
              })
            );
          })
        );
      }),
      tap(({ id, pricingEntry }) => {
        this.pricingService.saveItem(listId, finalItems ? 'finalItems' : 'items', id, pricingEntry.price, pricingEntry.amount, pricingEntry.use);
      })
    );
    this.progressService.showProgress(operations, rowsToFill.length)
      .pipe(
        first()
      )
      .subscribe();
  }

  trackByPanel(index: number, panel: LayoutRowDisplay): string {
    return panel.title;
  }

  private getWorldName(world: string): string {
    return this.i18n.getName(this.lazyData.getWorldName(world));
  }

}
