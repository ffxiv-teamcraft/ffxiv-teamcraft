import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { List } from '../../list/model/list';
import { PricingService } from '../pricing.service';
import { ListRow } from '../../list/model/list-row';
import { ObservableMedia } from '@angular/flex-layout';
import { SettingsService } from '../../settings/settings.service';
import { Observable } from 'rxjs';
import { ListsFacade } from '../../list/+state/lists.facade';
import { map, shareReplay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.less']
})
export class PricingComponent {

  list$: Observable<List>;

  items$: Observable<ListRow[]>;

  preCrafts$: Observable<ListRow[]>;

  @Output()
  close: EventEmitter<void> = new EventEmitter<void>();

  private costs: { [index: number]: number } = {};

  private spendingTotal = 0;

  constructor(private pricingService: PricingService, private media: ObservableMedia, public settings: SettingsService,
              private listsFacade: ListsFacade) {
    this.list$ = this.listsFacade.selectedList$.pipe(
      tap(list => {
        list.items.forEach(item => {
          this.costs[item.id] = this._getCraftCost(item, list);
        });
        list.finalItems.forEach(item => {
          this.costs[item.id] = this._getCraftCost(item, list);
        });
        this.spendingTotal = this._getSpendingTotal(list);
      }),
      shareReplay(1)
    );

    this.items$ = this.list$.pipe(
      map(list => list.items.filter(i => i.craftedBy === undefined || i.craftedBy.length === 0))
    );

    this.preCrafts$ = this.list$.pipe(
      map(list => list.items.filter(i => i.craftedBy && i.craftedBy.length > 0))
    );
  }

  public save(list: List): void {
    this.listsFacade.updateList(list);
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
    return this.spendingTotal;
  }

  private _getSpendingTotal(list: List): number {
    return list.finalItems.reduce((total, item) => {
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

  getTotalEarnings(rows: ListRow[], list: List): number {
    return rows.filter(row => row.usePrice).reduce((total, row) => {
      const price = this.pricingService.getEarnings(row);
      const amount = this.pricingService.getAmount(list.$key, row, true);
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
    return this.costs[row.id] || 0;
  }

  private _getCraftCost(row: ListRow, list: List): number {
    // If that's a final item or the price is custom, no recursion.
    if (this.pricingService.isCustomPrice(row) || row.requires === undefined || row.requires.length === 0) {
      const prices = this.pricingService.getPrice(row);
      const amounts = this.pricingService.getAmount(list.$key, row);
      return ((prices.nq * amounts.nq) + (prices.hq * amounts.hq)) / (amounts.hq + amounts.nq);
    }
    return row.requires.reduce((total, requirement) => {
      const requirementRow = list.getItemById(requirement.id, true);
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
  getBenefits(list: List): number {
    return this.getTotalEarnings(list.finalItems, list) - this.getSpendingTotal();
  }
}
