import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { MogstationItem } from '../../list/model/mogstation-item';

@Component({
  selector: 'app-mogstation',
  templateUrl: './mogstation.component.html',
  styleUrls: ['./mogstation.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MogstationComponent extends ItemDetailsPopup<MogstationItem> {

}
