import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { BellNodesService } from '../../../../core/data/bell-nodes.service';

@Component({
  selector: 'app-reduced-from',
  templateUrl: './reduced-from.component.html',
  styleUrls: ['./reduced-from.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReducedFromComponent extends ItemDetailsPopup {

  constructor(private bell: BellNodesService) {
    super();
  }

  getNodes(reduction: any): any[] {
    return this.bell.getNodesByItemId(reduction.obj.i);
  }

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }

}
