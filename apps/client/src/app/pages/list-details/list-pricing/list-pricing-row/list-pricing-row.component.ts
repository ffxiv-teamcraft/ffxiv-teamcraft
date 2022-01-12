import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FullPricingRow, ListArray } from '../model/full-pricing-row';
import { observeInput } from '../../../../core/rxjs/observe-input';
import { debounceTime, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { ListRow } from 'apps/client/src/app/modules/list/model/list-row';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { ListPricingService } from '../list-pricing.service';
import { DataType } from 'apps/client/src/app/modules/list/data/data-type';
import { TranslateService } from '@ngx-translate/core';
import { Price } from '../model/price';

@Component({
  selector: 'app-list-pricing-row',
  templateUrl: './list-pricing-row.component.html',
  styleUrls: ['./list-pricing-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPricingRowComponent extends TeamcraftComponent {

  @Input()
  listId: string;

  @Input()
  pricingData: FullPricingRow[];

  pricingData$ = observeInput(this, 'pricingData');

  @Input()
  itemId: number;

  itemId$ = observeInput(this, 'itemId');

  @Input()
  array: ListArray;

  @Input()
  listRow: ListRow;

  listRow$ = observeInput(this, 'listRow');

  @Input()
  odd = false;

  isCraft$ = this.listRow$.pipe(
    map(row => row.requires?.length > 0)
  );

  showHqInput$ = this.itemId$.pipe(
    switchMap(id => {
      return this.lazyData.getRow('hqFlags', id);
    })
  );

  itemPrice$: Observable<FullPricingRow> = combineLatest([
    this.pricingData$,
    this.itemId$,
    observeInput(this, 'array')
  ]).pipe(
    map(([pricingData, itemId, array]) => {
      const pricing = pricingData.find(row => {
        return row.id === itemId && row.array === array;
      });
      if (!pricing) {
        this.listPricingService.initItem(this.listId, array, this.listRow);
      }
      return pricing;
    })
  );

  priceToCraft$: Observable<{ price: Price }> = combineLatest([
    this.listRow$,
    this.pricingData$
  ]).pipe(
    map(([listRow, pricingData]) => {
      if (listRow.sources.some(s => s.type === DataType.CRAFTED_BY)) {
        return {
          price: this.listPricingService.getCraftingPrice(listRow, pricingData)
        };
      }
    })
  );

  updates$ = new Subject<FullPricingRow>();

  cheapestAtVendor$ = combineLatest([this.listRow$, this.itemPrice$]).pipe(
    map(([listRow, itemPrice]) => {
      const vendorPrice = this.listPricingService.getVendorPrice(listRow);
      if (vendorPrice > 0 && vendorPrice < itemPrice.price.nq && itemPrice.amount.nq > 0) {
        return vendorPrice;
      }
      return 0;
    })
  );

  constructor(private lazyData: LazyDataFacade, private listPricingService: ListPricingService,
              public translate: TranslateService) {
    super();
    this.updates$.pipe(
      debounceTime(1000),
      takeUntil(this.onDestroy$)
    ).subscribe((update) => {
      this.listPricingService.saveItem(this.listId, this.array, update.id, update.price, update.amount, update.use, !update.custom);
    });
    combineLatest([this.itemPrice$, this.priceToCraft$]).pipe(
      filter(([itemPrice, priceToCraft]) => itemPrice.custom === false && itemPrice?.price.nq !== priceToCraft?.price.nq),
      takeUntil(this.onDestroy$)
    ).subscribe(([itemPrice, priceToCraft]) => {
      itemPrice.price.nq = Math.round(priceToCraft.price.nq);
      itemPrice.price.hq = Math.round(priceToCraft.price.hq);
      this.listPricingService.saveItem(this.listId, this.array, itemPrice.id, itemPrice.price, itemPrice.amount, itemPrice.use, !itemPrice.custom);
    });
  }

  setVendorPrice(itemPrice: FullPricingRow, newPrice: number): void {
    itemPrice.price.nq = newPrice;
    itemPrice.price.fromVendor = true;
    this.updates$.next({ ...itemPrice });
  }

  applyCustomPriceChange(custom: boolean, itemPrice: FullPricingRow, priceToCraft: number): void {
    itemPrice.custom = custom;
    if (!custom) {
      itemPrice.price.nq = Math.round(priceToCraft);
      itemPrice.price.hq = Math.round(priceToCraft);
    }
    this.updates$.next({ ...itemPrice });
  }

}
