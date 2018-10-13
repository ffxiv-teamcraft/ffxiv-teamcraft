import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-voyages',
  templateUrl: './voyages.component.html',
  styleUrls: ['./voyages.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoyagesComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }

}
