import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { Drop } from '../../list/model/drop';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-hunting',
  templateUrl: './hunting.component.html',
  styleUrls: ['./hunting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HuntingComponent extends ItemDetailsPopup<Drop[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  getAdditionalMarkers(drop: Drop): Observable<Vector2[]> {
    return this.lazyData.getRow('monsters', Math.floor(drop.id % 1000000)).pipe(
      map(monster => {
        return monster?.positions.slice(1) || [];
      })
    );
  }

}
