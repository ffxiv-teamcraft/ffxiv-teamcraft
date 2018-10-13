import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorsComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }

}
