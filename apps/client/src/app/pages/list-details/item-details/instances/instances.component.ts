import { Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.less']
})
export class InstancesComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }

}
