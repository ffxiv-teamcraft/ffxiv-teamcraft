import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-vendors-details-popup',
    templateUrl: './vendors-details-popup.component.html',
    styleUrls: ['./vendors-details-popup.component.scss']
})
export class VendorsDetailsPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any) {
    }
}
