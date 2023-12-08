import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Drop } from '../../list/model/drop';
import { Observable, of } from 'rxjs';
import { MapMarker } from '../../map/map-marker';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MapComponent } from '../../map/map/map.component';
import { MapPositionComponent } from '../../map/map-position/map-position.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-hunting',
  templateUrl: './hunting.component.html',
  styleUrls: ['./hunting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgFor, FlexModule, DbButtonComponent, NgIf, MapPositionComponent, MapComponent, AsyncPipe, I18nPipe, I18nRowPipe, ClosestAetherytePipe]
})
export class HuntingComponent extends ItemDetailsPopup<Drop[]> {

  getMarkers(drop: Drop): Observable<MapMarker[]> {
    return of([drop.position]);
  }
}
