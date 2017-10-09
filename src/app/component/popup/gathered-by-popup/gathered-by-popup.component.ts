import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';
import {GatheringNode} from '../../../model/garland-tools/gathering-node';
import {ListRow} from '../../../model/list/list-row';

@Component({
    selector: 'app-gathered-by-popup',
    templateUrl: './gathered-by-popup.component.html',
    styleUrls: ['./gathered-by-popup.component.scss']
})
export class GatheredByPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: ListRow, private gt: GarlandToolsService) {
    }

    public getLocation(id: number): any {
        return this.gt.getLocation(id);
    }

    public getSlot(node: GatheringNode) {
        return node.items.find(item => item.id === this.data.id);
    }
}
