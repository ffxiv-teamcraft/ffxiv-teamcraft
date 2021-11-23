import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PricingService } from '../pricing.service';
import { Price } from '../model/price';
import { ItemAmount } from '../model/item-amount';
import { getItemSource, ListRow } from '../../list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { SettingsService } from '../../settings/settings.service';
import { DataType } from '../../list/data/data-type';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-pricing-row',
  templateUrl: './pricing-row.component.html',
  styleUrls: ['./pricing-row.component.less']
})
export class PricingRowComponent implements OnInit, OnDestroy {

  @Input()
  item: ListRow;

  @Input()
  listId: string;
  @Input()
  earning = false;
  @Input()
  preCraft = false;
  @Input()
  odd = false;
  price: Price = { hq: 0, nq: 0, fromVendor: false, fromMB: false };
  vendorPrice: Price;
  customPrice = false;
  amount: ItemAmount;
  priceFromCrafting = false;
  @Output()
  save: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  priceChange: EventEmitter<Price> = new EventEmitter<Price>();

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(private pricingService: PricingService, private message: NzMessageService,
              public translate: TranslateService, private cd: ChangeDetectorRef,
              public settings: SettingsService, private lazyData: LazyDataFacade) {
  }

  public _craftCost: number;

  @Input()
  public set craftCost(cost: number) {
    this._craftCost = cost;
    this.setAutoCost();
  }

  isCrystal(): boolean {
    return this.item.id < 20 && this.item.id > 1;
  }

  savePrice(): void {
    this.pricingService.savePrice(this.item, this.price);
    this.priceChange.emit(this.price);
  }

  saveCustomPrice(): void {
    this.pricingService.saveCustomPrice(this.item, this.customPrice);
    this.priceChange.emit(this.price);
  }

  changeNQ(): void {
    this.amount.nq = Math.min(this.amount.nq, this.item.amount);
    this.amount.hq = this.item.amount - this.amount.nq;
    this.saveAmount();
  }

  changeHQ(): void {
    this.amount.hq = Math.min(this.amount.hq, this.item.amount);
    this.amount.nq = this.item.amount - this.amount.hq;
    this.saveAmount();
  }

  saveAmount(): void {
    this.pricingService.saveAmount(this.listId, this.item, this.amount);
  }

  public afterNameCopy(name: string): void {
    this.message.success(
      this.translate.instant('Item_name_copied', { itemname: name })
    );
  }

  ngOnInit(): void {
    this.updatePrice();
    this.pricingService.priceChanged$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.updatePrice();
    });
  }

  private updatePrice(): void {
    this.lazyData.getRow('hqFlags', this.item.id).pipe(
      first()
    ).subscribe((canBeHq) => {
      this.vendorPrice = this.pricingService.getVendorPrice(this.item);
      this.customPrice = this.pricingService.isCustomPrice(this.item);
      if (this.earning) {
        this.price = this.pricingService.getEarnings(this.item);
      } else {
        this.price = this.pricingService.getPrice(this.item);
        this.setAutoCost();
      }
      this.amount = this.pricingService.getAmount(this.listId, this.item, this.earning && canBeHq === 1);
      if (this.item.usePrice === undefined) {
        this.item.usePrice = true;
      }
      setTimeout(() => {
        this.cd.detectChanges();
      });
    });
  }

  private setAutoCost(): void {
    if (this.preCraft && !this.customPrice && getItemSource(this.item, DataType.VENDORS).length === 0) {
      this.price.nq = this.price.hq = Math.ceil(this._craftCost) || 0;
      this.priceFromCrafting = true;
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
  }
}
