import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpearfishingShadowSize, SpearfishingSpeed } from '@ffxiv-teamcraft/types';
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
