import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {GarlandToolsService} from '../core/garland-tools.service';
import {I18nTools} from '../core/i18n-tools';
import {I18nName} from '../model/i18n-name';

@Component({
    selector: 'app-trade-details-popup',
    templateUrl: './trade-details-popup.component.html',
    styleUrls: ['./trade-details-popup.component.scss']
})
export class TradeDetailsPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any, private gt: GarlandToolsService, private i18n: I18nTools) {
    }

    public getName(name: I18nName): string {
        return this.i18n.getName(name);
    }

    public getLocation(id: number): any {
        return this.gt.getLocation(id);
    }

}
