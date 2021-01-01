import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';

@Component({
  selector: 'app-reduced-from',
  templateUrl: './reduced-from.component.html',
  styleUrls: ['./reduced-from.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReducedFromComponent extends ItemDetailsPopup<number[]> implements OnInit {

  nodes: Record<number, { node: GatheringNode, alarms: Alarm[] }[]> = {};

  constructor(private gatheringNodesService: GatheringNodesService, private alarmsFacade: AlarmsFacade) {
    super();
  }

  ngOnInit(): void {
    this.details.forEach(reduction => {
      this.nodes[reduction] = this.gatheringNodesService.getItemNodes(reduction).map(node => {
        return {
          node,
          alarms: this.alarmsFacade.generateAlarms(node)
        };
      });
    })
  }

}
