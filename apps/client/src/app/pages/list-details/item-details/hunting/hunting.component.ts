import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-hunting',
  templateUrl: './hunting.component.html',
  styleUrls: ['./hunting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HuntingComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }

}
