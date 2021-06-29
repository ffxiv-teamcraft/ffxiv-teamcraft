import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { Vector2 } from '../../../core/tools/vector2';
import { Drop } from '../../list/model/drop';

@Component({
  selector: 'app-hunting',
  templateUrl: './hunting.component.html',
  styleUrls: ['./hunting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HuntingComponent extends ItemDetailsPopup<Drop[]> {

  constructor(private lazyData: LazyDataService) {
    super();
  }

  getAdditionalMarkers(drop: Drop): Vector2[] {
    return this.lazyData.data.monsters[Math.floor(drop.id % 1000000).toString()]?.positions.slice(1);
  }

}
