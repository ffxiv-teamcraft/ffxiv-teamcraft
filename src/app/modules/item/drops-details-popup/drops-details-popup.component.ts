import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {Aetheryte} from '../../../core/data/aetheryte';
import {MapService} from '../../map/map.service';
import {Drop} from '../../../model/list/drop';

@Component({
    selector: 'app-drops-details-popup',
    templateUrl: './drops-details-popup.component.html',
    styleUrls: ['./drops-details-popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropsDetailsPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private mapService: MapService) {
    }

    getClosestAetheryte(drop: Drop): Observable<Aetheryte> {
        return this.mapService.getMapById(drop.position.zoneid).map((map) => {
            if (map !== undefined) {
                return this.mapService.getNearestAetheryte(map, drop.position);
            } else {
                return undefined;
            }
        });
    }
}
