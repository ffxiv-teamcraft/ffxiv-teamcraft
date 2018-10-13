import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }

}
