import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FullPricingRow, ListArray } from '../model/full-pricing-row';
import { observeInput } from '../../../../core/rxjs/observe-input';
import { debounceTime, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { ListRow } from '../../../../modules/list/model/list-row';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { ListPricingService } from '../list-pricing.service';
import { DataType } from '@ffxiv-teamcraft/types';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Price } from '../model/price';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { WorldNamePipe } from '../../../../pipes/pipes/world-name.pipe';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { MarketboardIconComponent } from '../../../../modules/marketboard/marketboard-icon/marketboard-icon.component';
import { ClipboardDirective } from '../../../../core/clipboard.directive';
import { I18nNameComponent } from '../../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgIf, AsyncPipe, DecimalPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-list-pricing-row',
    templateUrl: './list-pricing-row.component.html',
    styleUrls: ['./list-pricing-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzGridModule, FlexModule, NzCheckboxModule, FormsModule, ItemIconComponent, I18nNameComponent, ClipboardDirective, MarketboardIconComponent, NzTagModule, NzButtonModule, NzWaveModule, NzToolTipModule, NzSwitchModule, NzIconModule, NzInputModule, AsyncPipe, DecimalPipe, DatePipe, I18nPipe, TranslateModule, ItemNamePipe, WorldNamePipe]
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
    }),
    filter(p => !!p)
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
              public translate: TranslateService, public settings: SettingsService) {
    super();

    this.updates$.pipe(
      debounceTime(1000),
      takeUntil(this.onDestroy$)
    ).subscribe((update) => {
      this.listPricingService.saveItem(this.listId, this.array, update.id, update.price, update.amount, update.use, !update.custom);
    });

    combineLatest([this.itemPrice$, this.priceToCraft$]).pipe(
      filter(([itemPrice, priceToCraft]) => itemPrice.custom === false && Math.round(itemPrice?.price.nq) !== Math.round(priceToCraft?.price.nq)),
      takeUntil(this.onDestroy$)
    ).subscribe(([itemPrice, priceToCraft]) => {
      itemPrice.price.nq = Math.round(priceToCraft.price.nq);
      itemPrice.price.hq = Math.round(priceToCraft.price.hq);
      this.listPricingService.saveItem(this.listId, this.array, itemPrice.id, itemPrice.price, itemPrice.amount, itemPrice.use, !itemPrice.custom);
    });

    combineLatest([this.itemPrice$, this.listRow$]).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(([itemPrice, listRow]) => {
      const totalAmount = itemPrice.amount.nq + itemPrice.amount.hq;
      if (totalAmount !== listRow.amount) {
        const diff = listRow.amount - totalAmount;
        if (itemPrice.amount.nq > itemPrice.amount.hq) {
          itemPrice.amount.nq += diff;
        } else {
          itemPrice.amount.hq += diff;
        }
      }
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
