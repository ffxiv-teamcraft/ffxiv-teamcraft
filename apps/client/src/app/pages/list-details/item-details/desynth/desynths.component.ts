import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { BellNodesService } from '../../../../core/data/bell-nodes.service';
import { Alarm } from '../../../../core/alarms/alarm';

@Component({
  selector: 'app-desynths',
  templateUrl: './desynths.component.html',
  styleUrls: ['./desynths.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesynthsComponent extends ItemDetailsPopup {
}
