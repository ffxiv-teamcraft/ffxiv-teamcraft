import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LazyFishingSpotsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-fishing-spots-database-page';
import { TranslateModule } from '@ngx-translate/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { MapComponent } from '../../../../modules/map/map/map.component';
import { NgIf } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fishing-spot-position',
    templateUrl: './fishing-spot-position.component.html',
    styleUrls: ['./fishing-spot-position.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, NgIf, MapComponent, NzEmptyModule, TranslateModule]
})
export class FishingSpotPositionComponent {
  @Input() public loading = false;

  @Input() public spot?: LazyFishingSpotsDatabasePage = undefined;


}
