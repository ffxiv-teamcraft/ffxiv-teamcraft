import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-desynths',
  templateUrl: './desynths.component.html',
  styleUrls: ['./desynths.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesynthsComponent extends ItemDetailsPopup {
}
