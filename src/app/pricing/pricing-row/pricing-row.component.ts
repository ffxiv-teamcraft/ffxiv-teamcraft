import {Component, Input} from '@angular/core';
import {ListRow} from '../../model/list/list-row';
import {PricingService} from '../pricing.service';
import {Price} from '../model/price';

@Component({
    selector: 'app-pricing-row',
    templateUrl: './pricing-row.component.html',
    styleUrls: ['./pricing-row.component.scss']
})
export class PricingRowComponent {

    @Input()
    item: ListRow;

    constructor(private pricingService: PricingService) {
    }

    getPrice(): Price {
        return this.pricingService.get(this.item);
    }

    isCrystal(): boolean {
        return this.item.id < 20 && this.item.id > 1;
    }

}
