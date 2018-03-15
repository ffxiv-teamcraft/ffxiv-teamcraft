import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-venture-details-popup',
    templateUrl: './venture-details-popup.component.html',
    styleUrls: ['./venture-details-popup.component.scss']
})
export class VentureDetailsPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }

}
