import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { XivApiFishingSpot } from '../fishing-spot.component';

@Component({
  selector: 'app-fishing-spot-position',
  templateUrl: './fishing-spot-position.component.html',
  styleUrls: ['./fishing-spot-position.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishingSpotPositionComponent {
  @Input() public loading = false;
  @Input() public spot?: XivApiFishingSpot = undefined;

  constructor() {
  }
}
