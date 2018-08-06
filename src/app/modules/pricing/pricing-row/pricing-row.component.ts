import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PricingService} from '../pricing.service';
import {Price} from '../model/price';
import {ItemAmount} from '../model/item-amount';
import {ListRow} from '../../../model/list/list-row';
import {ObservableMedia} from '@angular/flex-layout';

@Component({
    selector: 'app-pricing-row',
    templateUrl: './pricing-row.component.html',
    styleUrls: ['./pricing-row.component.scss']
})
export class PricingRowComponent implements OnInit {

    @Input()
    item: ListRow;

    @Input()
    listId: string;

    public _craftCost: number;

    @Input()
    public set craftCost(cost: number) {
        this._craftCost = cost;
        this.setAutoCost();
    }

    @Input()
    earning = false;

    @Input()
    preCraft = false;

    @Input()
    odd = false;

    price: Price;

    customPrice = false;

    amount: ItemAmount;

    @Output()
    save: EventEmitter<void> = new EventEmitter<void>();

    constructor(private pricingService: PricingService, private media: ObservableMedia) {
    }

    isCrystal(): boolean {
        return this.item.id < 20 && this.item.id > 1;
    }

    savePrice(): void {
        this.pricingService.savePrice(this.item, this.price);
    }

    saveCustomPrice(): void {
        this.pricingService.saveCustomPrice(this.item, this.customPrice);
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
    }

    isMobile(): boolean {
        return this.media.isActive('sm') || this.media.isActive('xs');
    }

    private setAutoCost(): void {
        if (this.preCraft && !this.customPrice && this.item.vendors.length === 0) {
            this.price.nq = this.price.hq = Math.ceil(this._craftCost);
        }
    }
}
