import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-reduced-from',
  templateUrl: './reduced-from.component.html',
  styleUrls: ['./reduced-from.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReducedFromComponent extends ItemDetailsPopup<number[]> implements OnInit {

  showEverything$ = new BehaviorSubject(false);

  nodes: Record<number, { node: GatheringNode, alarms: Alarm[] }[]> = {};

  detailsDisplay$ = this.showEverything$.pipe(
    map(showEverything => {
      if (showEverything) {
        return {
          data: this.details,
          hasMore: false
        };
      }
      return {
        data: this.details.slice(0, 5),
        hasMore: this.details.length > 5
      };
    })
  );

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
    });
  }

}
