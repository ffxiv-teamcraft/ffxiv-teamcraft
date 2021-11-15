import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchievementsComponent extends ItemDetailsPopup {
}
