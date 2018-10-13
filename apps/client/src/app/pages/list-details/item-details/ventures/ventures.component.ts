import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-ventures',
  templateUrl: './ventures.component.html',
  styleUrls: ['./ventures.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VenturesComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }

}
