import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {BellNodesService} from '../../../core/data/bell-nodes.service';

@Component({
    selector: 'app-reduction-details-popup',
    templateUrl: './reduction-details-popup.component.html',
    styleUrls: ['./reduction-details-popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReductionDetailsPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private bell: BellNodesService) {
    }

    getNodes(reduction: any): any[] {
        return this.bell.getNodesByItemId(reduction.obj.i);
    }

    getDespawnTime(time: number, uptime: number): string {
        const res = (time + uptime / 60) % 24;
        return res.toString();
    }
}
