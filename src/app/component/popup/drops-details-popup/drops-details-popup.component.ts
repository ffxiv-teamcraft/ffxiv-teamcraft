import {Component, Inject} from '@angular/core';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';
import {MD_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-drops-details-popup',
    templateUrl: './drops-details-popup.component.html',
    styleUrls: ['./drops-details-popup.component.scss']
})
export class DropsDetailsPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any, private gt: GarlandToolsService) {
    }

    public getLocation(id: number): any {
        return this.gt.getLocation(id);
    }
}
