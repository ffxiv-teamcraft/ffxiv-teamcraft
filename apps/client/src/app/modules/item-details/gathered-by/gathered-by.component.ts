import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpearfishingShadowSize } from '../../../core/data/model/spearfishing-shadow-size';
import { SpearfishingSpeed } from '../../../core/data/model/spearfishing-speed';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-gathered-by',
  templateUrl: './gathered-by.component.html',
  styleUrls: ['./gathered-by.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheredByComponent extends ItemDetailsPopup {

  @Input()
  showAlarmsIntegration = false;

  SpearfishingSpeed = SpearfishingSpeed;

  SpearfishingShadowSize = SpearfishingShadowSize;

}
