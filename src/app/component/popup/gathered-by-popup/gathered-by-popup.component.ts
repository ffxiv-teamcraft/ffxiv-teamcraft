import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';
import {I18nToolsService} from '../../../core/i18n-tools.service';
import {I18nName} from '../../../model/i18n-name';

@Component({
    selector: 'app-gathered-by-popup',
    templateUrl: './gathered-by-popup.component.html',
    styleUrls: ['./gathered-by-popup.component.scss']
})
export class GatheredByPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any, private gt: GarlandToolsService, private i18n: I18nToolsService) {
    }

    public getName(name: I18nName): string {
        return this.i18n.getName(name);
    }

    public getLimitType(node: any): string {
        return this.getName(node.limitType);
    }

    public getLocation(id: number): any {
        return this.gt.getLocation(id);
    }

    public getSlot(node: any) {
        return node.items.find(item => item.id === this.data.id);
    }
}
