import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-trade-details-popup',
    templateUrl: './trade-details-popup.component.html',
    styleUrls: ['./trade-details-popup.component.scss']
})
export class TradeDetailsPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any) {
    }
}
