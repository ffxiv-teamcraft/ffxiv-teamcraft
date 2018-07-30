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
     * @param amountNeeded
     * @returns {number}
     */
    getCraftCost(row: ListRow, amountNeeded = row.amount_needed): number {
        if (this.pricingService.isCustomPrice(row) || row.requires === undefined || row.requires.length === 0) {
            const prices = this.pricingService.getPrice(row);
            const amounts = this.pricingService.getAmount(this.list.$key, row);
            const avgPrice = ((prices.nq * amounts.nq) + (prices.hq * amounts.hq)) / (amounts.hq + amounts.nq);
            return avgPrice * amountNeeded;
        }
        return row.requires.reduce((total, requirement) => {
            const requirementRow = this.list.getItemById(requirement.id, true);
            const amount = Math.ceil(requirement.amount / requirementRow.yield);
            return total + this.getCraftCost(requirementRow, amount * amountNeeded);
        }, 0);
    }

    /**
     * Gets the final benefits made from the whole list.
     * @returns {number}
     */
    getBenefits(): number {
        return this.getTotalEarnings(this.list.recipes) - this.getSpendingTotal();
    }

    public trackByItemFn(index: number, item: ListRow): number {
        return item.id;
    }
}
