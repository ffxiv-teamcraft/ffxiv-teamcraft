import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-desynth-popup',
    templateUrl: './desynth-popup.component.html',
    styleUrls: ['./desynth-popup.component.scss']
})
export class DesynthPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any) {
    }
}
