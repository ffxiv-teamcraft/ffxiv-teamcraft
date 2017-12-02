import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-drops-details-popup',
    templateUrl: './drops-details-popup.component.html',
    styleUrls: ['./drops-details-popup.component.scss']
})
export class DropsDetailsPopupComponent {

    // TODO get proper mob data to fix this.

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }
}
