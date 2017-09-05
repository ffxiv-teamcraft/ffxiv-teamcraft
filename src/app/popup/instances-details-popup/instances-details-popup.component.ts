import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {I18nTools} from '../../core/i18n-tools';
import {I18nName} from '../../model/i18n-name';

@Component({
    selector: 'app-instances-details-popup',
    templateUrl: './instances-details-popup.component.html',
    styleUrls: ['./instances-details-popup.component.scss']
})
export class InstancesDetailsPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any, private i18n: I18nTools) {
    }

    public getName(name: I18nName): string {
        return this.i18n.getName(name);
    }

}
