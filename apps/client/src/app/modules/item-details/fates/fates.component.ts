import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-fates',
  templateUrl: './fates.component.html',
  styleUrls: ['./fates.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FatesComponent extends ItemDetailsPopup {
}
