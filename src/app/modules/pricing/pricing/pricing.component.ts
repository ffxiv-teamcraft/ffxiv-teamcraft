import {Component, EventEmitter, Input, Output} from '@angular/core';
import {List} from '../../../model/list/list';
import {PricingService} from '../pricing.service';
import {ListRow} from '../../../model/list/list-row';
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
        // For each row of the list
        rows.forEach(row => {
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
        return rows.reduce((total, row) => {
            const price = this.pricingService.getEarnings(row);
            const amount = this.pricingService.getAmount(this.list.$key, row, true);
            return total + amount.nq * price.nq + amount.hq * price.hq;
        }, 0);
    }

    /**
     * Gets the minimum crafting cost of a given item.
     * @param {ListRow} row
     * @returns {number}
     */
    getCraftCost(row: ListRow): number {
        let total = 0;
        (row.requires || []).forEach(requirement => {
            const listRow = this.list.getItemById(requirement.id);
            const price = this.pricingService.getPrice(listRow);
            const amount = this.pricingService.getAmount(this.list.$key, listRow);
            // We're gona get the lowest possible price.
            let needed = row.amount_needed * requirement.amount;
            // First of all, we get the maximum of nq items;
            if (needed <= amount.nq) {
                total += needed * price.nq;
            } else {
                // If we don't have enough nq items, we take what we already have.
                total += amount.nq * price.nq;
                needed -= amount.nq;
                // Then we check for hq items
                if (needed <= amount.hq) {
                    // If we have enough of them, we can simply add them
                    total += needed * price.hq;
                } else {
                    // Else, we assume that the crafter already has some items in his inventory,
                    // that's why he didn't add them in the pricing.
                    // So we'll assume the remaining items are free.
                    total += amount.hq * price.hq;
                }
            }
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
