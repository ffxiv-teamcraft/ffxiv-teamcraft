import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Drop } from '../../list/model/drop';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapMarker } from '../../map/map-marker';
import { MapService } from '../../map/map.service';

@Component({
  selector: 'app-hunting',
  templateUrl: './hunting.component.html',
  styleUrls: ['./hunting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HuntingComponent extends ItemDetailsPopup<Drop[]> {

  constructor(private lazyData: LazyDataFacade, private mapService: MapService) {
    super();
  }

  getAdditionalMarkers(drop: Drop): Observable<MapMarker[]> {
    return this.lazyData.getRow('monsters', Math.floor(drop.id % 1000000)).pipe(
      map(monster => {
        return [this.mapService.getAvgPosition(monster.positions)];
      })
    );
  }
}
