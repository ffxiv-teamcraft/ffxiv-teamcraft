import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-patreon-popup',
    templateUrl: './patreon-popup.component.html',
    styleUrls: ['./patreon-popup.component.scss']
})
export class PatreonPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }

}
