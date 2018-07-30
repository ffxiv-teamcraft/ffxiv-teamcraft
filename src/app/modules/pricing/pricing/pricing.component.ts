import {Component, EventEmitter, Input, Output} from '@angular/core';
import {List} from '../../../model/list/list';
import {PricingService} from '../pricing.service';
import {ListRow} from '../../../model/list/list-row';
import {ObservableMedia} from '@angular/flex-layout';
import {ListService} from '../../../core/database/list.service';

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

    constructor(private pricingService: PricingService, private media: ObservableMedia, private listService: ListService) {
    }

    public save(): void {
        this.listService.set(this.list.$key, this.list).subscribe();
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
        return this.list.recipes.reduce((total, item) => total + this.getCraftCost(item), 0);
    }

    /**
     * Computes the total price of a given list category
     *
     * @param {ListRow[]} rows
     * @returns {number}
     */
    getTotalPrice(rows: ListRow[]): number {
        let total = 0;
        // For each row of the list
        rows.filter(row => row.usePrice).forEach(row => {
            // Get the amount of items required.
            const amount = this.pricingService.getAmount(this.list.$key, row);
            // Get the price of the item.
            const price = this.pricingService.getPrice(row);
            // Compute the price of this row.
            total += amount.nq * price.nq + amount.hq * price.hq;
        });
        return total;
    }

    getTotalEarnings(rows: ListRow[]): number {
        return rows.filter(row => row.usePrice).reduce((total, row) => {
            const price = this.pricingService.getEarnings(row);
            const amount = this.pricingService.getAmount(this.list.$key, row, true);
            return total + amount.nq * price.nq + amount.hq * price.hq;
        }, 0);
    }

    /**
     * Gets the crafting cost of a given item.
     * @param {ListRow} row
     * @returns {number}
     */
    getCraftCost(row: ListRow): number {
        let total = 0;
        (row.requires || []).forEach(requirement => {
            const listRow = this.list.getItemById(requirement.id);
            if (!listRow.usePrice) {
                return
            }
            const price = this.pricingService.getPrice(listRow);
            const amount = this.pricingService.getAmount(this.list.$key, listRow);
            total += amount.nq * price.nq + amount.hq * price.hq;
        });
        return total;
    }

    /**
     * Gets the final benefits made from the whole list.
     * @returns {number}
     */
    getBenefits(): number {
        return this.getTotalEarnings(this.list.recipes) - this.getSpendingTotal();
    }
}
