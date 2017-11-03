import {Component, Inject} from '@angular/core';
import {I18nToolsService} from '../../../core/i18n-tools.service';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-reduction-details-popup',
    templateUrl: './reduction-details-popup.component.html',
    styleUrls: ['./reduction-details-popup.component.scss']
})
export class ReductionDetailsPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private gt: GarlandToolsService, private i18n: I18nToolsService) {
    }
}
