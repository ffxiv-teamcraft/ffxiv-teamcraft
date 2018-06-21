import {Component, Input, OnInit} from '@angular/core';
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

    @Input()
    craftCost: number;

    @Input()
    earning = false;

    @Input()
    odd = false;

    price: Price;

    amount: ItemAmount;

    constructor(private pricingService: PricingService, private media: ObservableMedia) {
    }

    isCrystal(): boolean {
        return this.item.id < 20 && this.item.id > 1;
    }

    savePrice(): void {
        this.pricingService.savePrice(this.item, this.price);
    }

    saveAmount(): void {
        this.pricingService.saveAmount(this.listId, this.item, this.amount);
    }

    ngOnInit(): void {
        if (this.earning) {
            this.price = this.pricingService.getEarnings(this.item);
        } else {
            this.price = this.pricingService.getPrice(this.item);
        }
        this.amount = this.pricingService.getAmount(this.listId, this.item, this.earning);
    }

    isMobile(): boolean {
        return this.media.isActive('sm') || this.media.isActive('xs');
    }

}
