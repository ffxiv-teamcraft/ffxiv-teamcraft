import {Component, Input, OnInit} from '@angular/core';
import {ListRow} from '../../model/list/list-row';
import {PricingService} from '../pricing.service';
import {Price} from '../model/price';
import {ItemAmount} from '../model/item-amount';

@Component({
    selector: 'app-pricing-row',
    templateUrl: './pricing-row.component.html',
    styleUrls: ['./pricing-row.component.scss']
})
export class PricingRowComponent implements OnInit {

    @Input()
    item: ListRow;

    price: Price;

    amount: ItemAmount;

    constructor(private pricingService: PricingService) {
    }

    isCrystal(): boolean {
        return this.item.id < 20 && this.item.id > 1;
    }

    savePrice(): void {
        this.pricingService.save(this.item, this.price);
    }

    ngOnInit(): void {
        this.price = this.pricingService.get(this.item);
        this.amount = {nq: this.item.amount, hq: 0};
    }

}
