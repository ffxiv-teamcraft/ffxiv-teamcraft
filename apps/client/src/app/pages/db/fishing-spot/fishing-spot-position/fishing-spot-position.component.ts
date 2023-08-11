import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LazyFishingSpotsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-fishing-spots-database-page';

@Component({
  selector: 'app-fishing-spot-position',
  templateUrl: './fishing-spot-position.component.html',
  styleUrls: ['./fishing-spot-position.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishingSpotPositionComponent {
  @Input() public loading = false;

  @Input() public spot?: LazyFishingSpotsDatabasePage = undefined;


}
