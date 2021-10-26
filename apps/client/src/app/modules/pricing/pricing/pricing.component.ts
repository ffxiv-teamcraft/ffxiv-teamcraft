import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { List } from '../../list/model/list';
import { PricingService } from '../pricing.service';
import { getItemSource, ListRow } from '../../list/model/list-row';
import { MediaObserver } from '@angular/flex-layout';
import { SettingsService } from '../../settings/settings.service';
import { interval, Observable, Subject } from 'rxjs';
import { ListsFacade } from '../../list/+state/lists.facade';
import { filter, first, map, mergeMap, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { XivapiService } from '@xivapi/angular-client';
import { AuthFacade } from '../../../+state/auth.facade';
import { ProgressPopupService } from '../../progress-popup/progress-popup.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NumberQuestionPopupComponent } from '../../number-question-popup/number-question-popup/number-question-popup.component';
import { UniversalisService } from '../../../core/api/universalis.service';
import { DataType } from '../../list/data/data-type';
import { ListController } from '../../list/list-controller';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.less']
})
export class PricingComponent implements AfterViewInit {

  list$: Observable<List>;

  items$: Observable<ListRow[]>;

  crystals$: Observable<ListRow[]>;

  preCrafts$: Observable<ListRow[]>;

  @Output()
  close: EventEmitter<void> = new EventEmitter<void>();

  private costs: { [index: number]: number } = {};

  public spendingTotal = 0;

  public discount = 0;

  public flatDiscount = 0;

  private server$: Observable<string> = this.authFacade.mainCharacter$.pipe(
    map(char => char.Server)
  );

  loggedIn$ = this.authFacade.loggedIn$;

  constructor(private pricingService: PricingService, private media: MediaObserver, public settings: SettingsService,
              private listsFacade: ListsFacade, private xivapi: XivapiService, private authFacade: AuthFacade,
              private progressService: ProgressPopupService, private i18n: I18nToolsService,
              private translate: TranslateService, private message: NzMessageService, private cd: ChangeDetectorRef,
              private lazyData: LazyDataFacade, private dialog: NzModalService, private universalis: UniversalisService) {
    this.list$ = this.listsFacade.selectedList$.pipe(
      tap(list => {
        this.updateCosts(list);
        this.updateCosts(list);
        const discounts = (localStorage.getItem(`discounts:${list.$key}`) || '0,0').split(',');
        this.flatDiscount = +discounts[0];
        this.discount = +discounts[1];
      }),
      shareReplay(1)
    );

    this.crystals$ = this.list$.pipe(
      map(list => list.items.filter(i => i.id < 20).sort((a, b) => a.id - b.id)),
      shareReplay(1)
    );

    this.items$ = this.list$.pipe(
      map(list => list.items.filter(i => (getItemSource(i, DataType.CRAFTED_BY).length === 0) && i.id >= 20)),
      shareReplay(1)
    );

    this.preCrafts$ = this.list$.pipe(
      map(list => list.items.filter(i => getItemSource(i, DataType.CRAFTED_BY).length > 0)),
      shareReplay(1)
    );
  }

  public saveDiscounts(listKey: string): void {
    localStorage.setItem(`discounts:${listKey}`, `${this.flatDiscount},${this.discount}`);
  }

  public setBenefits(items: ListRow[], list: List): void {
    this.dialog.create({
      nzTitle: `${this.translate.instant('PRICING.Enter_total_earnings')}`,
      nzContent: NumberQuestionPopupComponent,
      nzComponentParams: {
        value: this.getTotalEarnings(items, list)
      },
      nzFooter: null
    }).afterClose
      .pipe(
        filter(value => value || value === 0)
      )
      .subscribe(value => {
        items.forEach(item => {
          const totalPricePerItem = value / items.length;
          const pricePerCraft = Math.round(totalPricePerItem / item.amount);
          this.pricingService.savePrice(item, {
            fromMB: false,
            fromVendor: false,
            hq: pricePerCraft,
            nq: pricePerCraft
          });
        });
        this.pricingService.priceChanged$.next(null);
      });
  }

  public fillMbCosts(rows: ListRow[], finalItems = false): void {
    const stopInterval$ = new Subject<void>();
    const rowsToFill = rows
      .filter(row => {
        const price = this.pricingService.getPrice(row);
        return !price.fromVendor || finalItems;
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
            return this.universalis.getDCPrices(dc, row.id).pipe(
              map(res => {
                const item = res[0];
                let prices = item.Prices;
                if (finalItems || this.settings.disableCrossWorld) {
                  prices = prices.filter(price => (<any>price).Server === server);
                }
                const cheapestHq = prices.filter(p => p.IsHQ)
                  .sort((a, b) => a.PricePerUnit - b.PricePerUnit)[0];
                const cheapestNq = prices.filter(p => !p.IsHQ)
                  .sort((a, b) => a.PricePerUnit - b.PricePerUnit)[0];
                return {
                  item: row,
                  hq: cheapestHq ? cheapestHq.PricePerUnit : this.pricingService.getPrice(row).hq,
                  hqServer: cheapestHq ? (<any>cheapestHq).Server : null,
                  nq: cheapestNq ? cheapestNq.PricePerUnit : this.pricingService.getPrice(row).nq,
                  nqServer: cheapestNq ? (<any>cheapestNq).Server : null,
                  updated: item.Updated
                };
              })
            );
          })
        );
      }),
      tap((res) => {
        this.pricingService.savePrice(res.item, {
          nq: res.nq,
          nqServer: res.nqServer,
          hq: res.hq,
          hqServer: res.hqServer,
          fromVendor: false,
          fromMB: true,
          updated: res.updated
        });
      })
    );
    this.progressService.showProgress(operations, rowsToFill.length)
      .pipe(
        switchMap(() => this.list$),
        first()
      )
      .subscribe((res) => {
        if (res instanceof Error) {
          this.message.error(this.translate.instant('MARKETBOARD.Error'));
        } else {
          stopInterval$.next(null);
          this.pricingService.priceChanged$.next(null);
          this.updateCosts(res);
        }
      });
  }

  public updateCosts(list: List): void {
    const items = this.topologicalSort(list.items);
    items.forEach(item => {
      this.costs[item.id] = this._getCraftCost(item, list);
    });
    list.finalItems.forEach(item => {
      this.costs[item.id] = this._getCraftCost(item, list);
    });
    this.spendingTotal = this.getSpendingTotal(list);
    this.cd.detectChanges();
  }

  public save(list: List): void {
    this.listsFacade.updateList(list);
  }

  public getEarningText = (rows: ListRow[], list: List) => {
    return safeCombineLatest(rows.filter(row => row.usePrice !== false).map(row => {
      return this.i18n.getNameObservable('items', row.id).pipe(
        map(itemName => ({ row, itemName }))
      );
    })).pipe(
      map(rowsWithName => {
        return rowsWithName.reduce((total, { row, itemName }) => {
          const price = this.pricingService.getEarnings(row);
          const amount = this.pricingService.getAmount(list.$key, row, true);
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
        }, `${this.translate.instant('COMMON.Total')}: ${this.getTotalEarnings(rows, list).toLocaleString()}gil\n`);
      })
    );
  };

  public getSpendingText = (rows: ListRow[], list: List) => {
    return safeCombineLatest(rows.filter(row => row.usePrice).map(row => {
      return this.i18n.getNameObservable('items', row.id).pipe(
        map(itemName => ({ row, itemName }))
      );
    })).pipe(
      map(rowsWithName => {
        return rowsWithName
          .reduce((total, { row, itemName }) => {
            const price = this.pricingService.getPrice(row);
            const amount = this.pricingService.getAmount(list.$key, row, false);
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
          }, `${this.translate.instant('COMMON.Total')}: ${this.getTotalEarnings(rows, list).toLocaleString()}gil\n`);
      })
    );
  };

  public getSpendingTotal(list: List): number {
    return list.finalItems.reduce((total, item) => {
      let cost = this.getCraftCost(item);
      if (this.pricingService.isCustomPrice(item)) {
        const price = this.pricingService.getPrice(item);
        const amount = this.pricingService.getAmount(list.$key, item);
        cost = Math.min(1, price.nq * amount.nq) * Math.min(1, price.hq * amount.hq);
      } else {
        if (this.settings.expectToSellEverything) {
          // If we expect to sell everything, price based on amount of items crafted
          cost *= item.amount_needed * item.yield;
        } else {
          // Else, price based on amount of items used
          cost *= item.amount;
        }
      }
      return total + cost;
    }, 0);
  }

  getTotalEarnings(rows: ListRow[], list: List): number {
    const totalPrice = rows.filter(row => row.usePrice).reduce((total, row) => {
      const price = this.pricingService.getEarnings(row);
      const amount = this.pricingService.getAmount(list.$key, row, true);
      return total + amount.nq * price.nq + amount.hq * price.hq;
    }, 0);
    return (totalPrice - this.flatDiscount) * (1 - (this.discount / 100));
  }

  /**
   * Gets the crafting cost of a given item.
   * @param {ListRow} row
   * @returns {number}
   */
  getCraftCost(row: ListRow): number {
    if (!row.usePrice) {
      return 0;
    }
    return this.costs[row.id] || 0;
  }

  private _getCraftCost(row: ListRow, list: List): number {
    const price = (row.requires || []).reduce((total, requirement) => {
      const requirementRow = ListController.getItemById(list, requirement.id, true);
      if (this.settings.expectToSellEverything) {
        // If you expect to sell everything, just divide by yield.
        return total + (this.getCraftCost(requirementRow) / row.yield) * requirement.amount;
      } else {
        // else, divide by amount / amount_needed, aka adjusted yield for when you craft more than you sell because of yield.
        return total + (this.getCraftCost(requirementRow) / (row.amount / row.amount_needed)) * requirement.amount;
      }
    }, 0);

    // If that's a final item or the price is custom, no recursion.
    if (this.pricingService.isCustomPrice(row)
      || price === 0
      || (this.pricingService.getPrice(row).fromVendor && list.finalItems.indexOf(row) === -1)) {

      if (this.settings.ignoreCompletedItemInPricing && row.done >= row.amount) {
        return 0;
      }

      const prices = this.pricingService.getPrice(row);
      const amounts = this.pricingService.getAmount(list.$key, row);
      if (prices.hq > 0 && prices.hq < prices.nq) {
        return prices.hq * (amounts.nq || 1) * (amounts.hq || 1) / (amounts.hq + amounts.nq);
      }
      return ((prices.nq * amounts.nq) + (prices.hq * amounts.hq)) / (amounts.hq + amounts.nq);
    }
    return price;
  }

  /**
   * Gets the final benefits made from the whole list.
   * @returns {number}
   */
  getBenefits(list: List): number {
    return this.getTotalEarnings(list.finalItems, list) - this.spendingTotal;
  }

  public trackByItemFn(index: number, item: ListRow): number {
    return item.id;
  }

  private topologicalSort(data: ListRow[]): ListRow[] {
    const res: ListRow[] = [];
    const doneList: boolean[] = [];
    while (data.length > res.length) {
      let resolved = false;

      for (const item of data) {
        if (res.indexOf(item) > -1) {
          // item already in resultset
          continue;
        }
        resolved = true;

        if (item.requires !== undefined) {
          for (const dep of item.requires) {
            // We have to check if it's not a precraft, as some dependencies aren't resolvable inside the current array.
            const depIsInArray = data.find(row => row.id === dep.id) !== undefined;
            if (!doneList[dep.id] && depIsInArray) {
              // there is a dependency that is not met:
              resolved = false;
              break;
            }
          }
        }
        if (resolved) {
          // All dependencies are met:
          doneList[item.id] = true;
          res.push(item);
        }
      }
    }
    return res;
  }

  ngAfterViewInit(): void {
    this.list$.pipe(
      first()
    ).subscribe(list => {
      this.updateCosts(list);
    });
    setTimeout(() => {
      this.cd.detectChanges();
    }, 500);
  }

  private getWorldName(world: string): string {
    return this.i18n.getName(this.lazyData.getWorldName(world));
  }
}
