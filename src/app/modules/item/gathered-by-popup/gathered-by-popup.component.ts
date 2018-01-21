import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ListRow} from '../../../model/list/list-row';

@Component({
    selector: 'app-gathered-by-popup',
    templateUrl: './gathered-by-popup.component.html',
    styleUrls: ['./gathered-by-popup.component.scss']
})
export class GatheredByPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: ListRow) {
    }

    getDespawnTime(time: number, uptime: number): string {
        const res = time + (uptime / 60);
        if (res === 24) {
            return '00';
        }
        return res.toString();
    }
}
