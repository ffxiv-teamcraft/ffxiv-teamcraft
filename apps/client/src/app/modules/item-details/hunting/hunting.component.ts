import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Drop } from '../../list/model/drop';
import { map, Observable } from 'rxjs';
import { MapMarker } from '../../map/map-marker';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MapComponent } from '../../map/map/map.component';
import { MapPositionComponent } from '../../map/map-position/map-position.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { AsyncPipe } from '@angular/common';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-hunting',
  templateUrl: './hunting.component.html',
  styleUrls: ['./hunting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FlexModule, DbButtonComponent, MapPositionComponent, MapComponent, AsyncPipe, I18nPipe, I18nRowPipe, ClosestAetherytePipe]
})
export class HuntingComponent extends ItemDetailsPopup<Drop[]> {

  #lazyData = inject(LazyDataFacade);

  getMarkers(drop: Drop): Observable<MapMarker[]> {
    return this.#lazyData.getRow('monsters', drop.id).pipe(
      map(monster => monster?.positions || []),
      filter(positions => positions.length > 0)
    );
  }
}
