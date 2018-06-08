import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Trade} from '../../../model/list/trade';

@Component({
    selector: 'app-trade-details-popup',
    templateUrl: './trade-details-popup.component.html',
    styleUrls: ['./trade-details-popup.component.scss']
})
export class TradeDetailsPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }

    getTotal(trade: Trade): number {
        return Math.ceil((trade.currencyAmount / trade.itemAmount) * (this.data.amount - this.data.done));
    }
}
