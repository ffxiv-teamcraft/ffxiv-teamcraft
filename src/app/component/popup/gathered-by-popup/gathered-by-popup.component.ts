import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';

@Component({
    selector: 'app-gathered-by-popup',
    templateUrl: './gathered-by-popup.component.html',
    styleUrls: ['./gathered-by-popup.component.scss']
})
export class GatheredByPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: any, private gt: GarlandToolsService) {
    }

    public getLocation(id: number): any {
        return this.gt.getLocation(id);
    }

    public getSlot(node: any) {
        return node.items.find(item => item.id === this.data.id);
    }
}
