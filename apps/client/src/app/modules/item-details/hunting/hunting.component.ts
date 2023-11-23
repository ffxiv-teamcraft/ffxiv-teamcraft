import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Drop } from '../../list/model/drop';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapMarker } from '../../map/map-marker';
import { MapService } from '../../map/map.service';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MapComponent } from '../../map/map/map.component';
import { MapPositionComponent } from '../../map/map-position/map-position.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-hunting',
    templateUrl: './hunting.component.html',
    styleUrls: ['./hunting.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor, FlexModule, DbButtonComponent, NgIf, MapPositionComponent, MapComponent, AsyncPipe, I18nPipe, I18nRowPipe, ClosestAetherytePipe]
})
export class HuntingComponent extends ItemDetailsPopup<Drop[]> {

  constructor(private lazyData: LazyDataFacade, private mapService: MapService) {
    super();
  }

  getMarkers(drop: Drop): Observable<MapMarker[]> {
    return this.lazyData.getRow('monsters', Math.floor(drop.id % 1000000)).pipe(
      map(monster => {
        return [drop?.position, this.mapService.getAvgPosition(monster.positions)];
      })
    );
  }
}
