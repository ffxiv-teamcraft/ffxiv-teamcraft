import {Component, Inject, OnInit} from '@angular/core';
import {I18nToolsService} from '../../../core/i18n-tools.service';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';
import {MD_DIALOG_DATA} from '@angular/material';
import {I18nName} from 'app/model/list/i18n-name';

@Component({
    selector: 'app-reduction-details-popup',
    templateUrl: './reduction-details-popup.component.html',
    styleUrls: ['./reduction-details-popup.component.scss']
})
export class ReductionDetailsPopupComponent implements OnInit {

    constructor(@Inject(MD_DIALOG_DATA) public data: any, private gt: GarlandToolsService, private i18n: I18nToolsService) {
    }

    ngOnInit() {
    }

    public getName(name: I18nName): string {
        return this.i18n.getName(name);
    }
}
