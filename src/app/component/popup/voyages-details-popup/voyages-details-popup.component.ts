import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-voyages-details-popup',
    templateUrl: './voyages-details-popup.component.html',
    styleUrls: ['./voyages-details-popup.component.scss']
})
export class VoyagesDetailsPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }

}
