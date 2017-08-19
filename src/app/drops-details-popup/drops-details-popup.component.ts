import {Component, Inject} from '@angular/core';
import {I18nTools} from '../core/i18n-tools';
import {GarlandToolsService} from '../core/garland-tools.service';
import {MD_DIALOG_DATA} from '@angular/material';
import {I18nName} from '../model/i18n-name';

@Component({
    selector: 'app-drops-details-popup',
    templateUrl: './drops-details-popup.component.html',
    styleUrls: ['./drops-details-popup.component.scss']
})
export class DropsDetailsPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any, private gt: GarlandToolsService, private i18n: I18nTools) {
    }

    public getName(name: I18nName): string {
        return this.i18n.getName(name);
    }

    public getLocation(id: number): any {
        return this.gt.getLocation(id);
    }
}
