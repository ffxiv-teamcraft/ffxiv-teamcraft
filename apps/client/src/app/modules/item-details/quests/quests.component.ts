import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.component.html',
  styleUrls: ['./quests.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestsComponent extends ItemDetailsPopup<number[]> {

  constructor(public translate: TranslateService) {
    super();
  }
}
