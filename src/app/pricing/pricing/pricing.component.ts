import {Component, EventEmitter, Input, Output} from '@angular/core';
import {List} from '../../model/list/list';
import {PricingService} from '../pricing.service';
import {ListRow} from '../../model/list/list-row';
import {ObservableMedia} from '@angular/flex-layout';

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {

    @Input()
    list: List;

    @Output()
    close: EventEmitter<void> = new EventEmitter<void>();

    constructor(private pricingService: PricingService, private media: ObservableMedia) {
    }

    public isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

    /**
     * Get the total spending of the list.
     *
     * @returns {number}
     */
    getSpendingTotal(): number {
        return this.getTotalPrice(this.list.crystals) +
            this.getTotalPrice(this.list.gathers) +
            this.getTotalPrice(this.list.others) +
            this.getTotalPrice(this.list.preCrafts);
    }

    /**
     * Computes the total price of a given list category
     *
     * @param {ListRow[]} rows
     * @returns {number}
     */
    getTotalPrice(rows: ListRow[]): number {
        let total = 0;
        rows.forEach(row => {
            const amount = this.pricingService.getAmount(this.list.$key, row);
            const price = this.pricingService.getPrice(row);
            total += amount.nq * price.nq + amount.hq * price.hq;
        });
        return total;
    }

    /**
     * Gets the final benefits made from the whole list.
     * @returns {number}
     */
    getBenefits(): number {
        return this.getTotalPrice(this.list.recipes) - this.getSpendingTotal();
    }
}
