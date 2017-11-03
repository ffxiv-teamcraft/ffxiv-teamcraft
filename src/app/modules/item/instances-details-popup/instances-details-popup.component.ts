import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-instances-details-popup',
    templateUrl: './instances-details-popup.component.html',
    styleUrls: ['./instances-details-popup.component.scss']
})
export class InstancesDetailsPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }

}
