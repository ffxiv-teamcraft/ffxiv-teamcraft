import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PricingService } from '../pricing.service';
import { Price } from '../model/price';
import { ItemAmount } from '../model/item-amount';
import { ListRow } from '../../list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-pricing-row',
  templateUrl: './pricing-row.component.html',
  styleUrls: ['./pricing-row.component.less']
})
export class PricingRowComponent implements OnInit {

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
  price: Price = { hq: 0, nq: 0, fromVendor: false };
  customPrice = false;
  amount: ItemAmount;
  @Output()
  save: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  priceChange: EventEmitter<Price> = new EventEmitter<Price>();

  constructor(private pricingService: PricingService, private message: NzMessageService,
              private translator: TranslateService, private cd: ChangeDetectorRef) {
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
      this.translator.instant('Item_name_copied', { itemname: name })
    );
  }

  ngOnInit(): void {
    this.customPrice = this.pricingService.isCustomPrice(this.item);
    if (this.earning) {
      this.price = this.pricingService.getEarnings(this.item);
    } else {
      this.price = this.pricingService.getPrice(this.item);
      this.setAutoCost();
    }
    this.amount = this.pricingService.getAmount(this.listId, this.item, this.earning);
    if (this.item.usePrice === undefined) {
      this.item.usePrice = true;
    }
    setTimeout(() => {
      this.cd.detectChanges();
    });
  }

  private setAutoCost(): void {
    if (this.preCraft && !this.customPrice && this.item.vendors.length === 0) {
      this.price.nq = this.price.hq = Math.ceil(this._craftCost) || 0;
    }
  }
}
