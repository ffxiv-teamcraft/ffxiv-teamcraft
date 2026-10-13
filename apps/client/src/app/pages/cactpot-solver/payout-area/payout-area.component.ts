import { Component } from "@angular/core";
import { PayoutEntry, PAYOUT_TABLE } from '../model/payout-entry';

@Component({
  selector: 'app-payout-area',
  templateUrl: 'payout-area.component.html',
  styleUrls: ['payout-area.component.less']
})
export class PayoutAreaComponent {
  payoutTable: PayoutEntry[] = PAYOUT_TABLE;

  get leftColumn(): PayoutEntry[] {
    return this.payoutTable.slice(0, Math.ceil(this.payoutTable.length / 2));
  }

  get rightColumn(): PayoutEntry[] {
    return this.payoutTable.slice(Math.ceil(this.payoutTable.length / 2));
  }
}