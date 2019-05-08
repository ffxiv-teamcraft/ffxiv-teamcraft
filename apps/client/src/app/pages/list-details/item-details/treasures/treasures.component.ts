import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-treasures',
  templateUrl: './treasures.component.html',
  styleUrls: ['./treasures.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreasuresComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }
}
