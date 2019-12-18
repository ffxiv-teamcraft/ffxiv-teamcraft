import { Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.less']
})
export class InstancesComponent extends ItemDetailsPopup {

  constructor(public translate: TranslateService) {
    super();
  }

}
