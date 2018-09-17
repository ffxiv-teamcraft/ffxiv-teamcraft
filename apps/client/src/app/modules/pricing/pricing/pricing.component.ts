import { Component, EventEmitter, Input, Output } from '@angular/core';
import { List } from '../../../core/list/model/list';
import { PricingService } from '../pricing.service';
import { ListRow } from '../../../core/list/model/list-row';
import { ObservableMedia } from '@angular/flex-layout';
import { ListService } from '../../../core/database/list.service';
import { SettingsService } from '../../../pages/settings/settings.service';

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

  constructor(private pricingService: PricingService, private media: ObservableMedia, private listService: ListService,
              public settings: SettingsService) {
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
    return this.list.finalItems.reduce((total, item) => {
      let cost = this.getCraftCost(item);
      if (this.settings.expectToSellEverything) {
        // If we expect to sell everything, price based on amount of items crafted
        cost *= item.amount_needed * item.yield;
      } else {
        // Else, price based on amount of items used
        cost *= item.amount;
      }
      return total + cost;
    }, 0);
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
    if (!row.usePrice) {
      return 0;
    }
    // If that's a final item or the price is custom, no recursion.
    if (this.pricingService.isCustomPrice(row) || row.requires === undefined || row.requires.length === 0) {
      const prices = this.pricingService.getPrice(row);
      const amounts = this.pricingService.getAmount(this.list.$key, row);
      return ((prices.nq * amounts.nq) + (prices.hq * amounts.hq)) / (amounts.hq + amounts.nq);
    }
    return row.requires.reduce((total, requirement) => {
      const requirementRow = this.list.getItemById(requirement.id, true);
      if (this.settings.expectToSellEverything) {
        // If you expect to sell everything, just divide by yield.
        return total + (this.getCraftCost(requirementRow) / row.yield) * requirement.amount;
      } else {
        // else, divide by amount / amount_needed, aka adjusted yield for when you craft more than you sell because of yield.
        return total + (this.getCraftCost(requirementRow) / (row.amount / row.amount_needed)) * requirement.amount;
      }
    }, 0);
  }

  /**
   * Gets the final benefits made from the whole list.
   * @returns {number}
   */
  getBenefits(): number {
    return this.getTotalEarnings(this.list.finalItems) - this.getSpendingTotal();
  }

  public trackByItemFn(index: number, item: ListRow): number {
    return item.id;
  }
}
