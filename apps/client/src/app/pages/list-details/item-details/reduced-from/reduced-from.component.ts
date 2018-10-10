import { Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-reduced-from',
  templateUrl: './reduced-from.component.html',
  styleUrls: ['./reduced-from.component.less']
})
export class ReducedFromComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }

}
