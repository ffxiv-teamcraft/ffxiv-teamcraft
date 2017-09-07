import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';
import {I18nToolsService} from '../../../core/i18n-tools.service';
import {I18nName} from '../../../model/i18n-name';

@Component({
  selector: 'app-vendors-details-popup',
  templateUrl: './vendors-details-popup.component.html',
  styleUrls: ['./vendors-details-popup.component.scss']
})
export class VendorsDetailsPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any, private gt: GarlandToolsService, private i18n: I18nToolsService) {
    }

    public getName(name: I18nName): string {
        return this.i18n.getName(name);
    }

    public getLocation(id: number): any {
        return this.gt.getLocation(id);
    }

}
