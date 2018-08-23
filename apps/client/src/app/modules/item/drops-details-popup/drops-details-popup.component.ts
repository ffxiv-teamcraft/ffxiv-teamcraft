import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import { Aetheryte } from '../../../core/data/aetheryte';
import { MapService } from '../../map/map.service';
import { Drop } from '../../../model/list/drop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-drops-details-popup',
  templateUrl: './drops-details-popup.component.html',
  styleUrls: ['./drops-details-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropsDetailsPopupComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private mapService: MapService) {
  }

  getClosestAetheryte(drop: Drop): Observable<Aetheryte> {
    return this.mapService.getMapById(drop.position.zoneid)
      .pipe(map((mapData) => {
          if (mapData !== undefined) {
            return this.mapService.getNearestAetheryte(mapData, drop.position);
          } else {
            return undefined;
          }
        })
      );
  }
}
