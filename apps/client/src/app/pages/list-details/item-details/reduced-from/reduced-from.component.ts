import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { BellNodesService } from '../../../../core/data/bell-nodes.service';
import { Alarm } from '../../../../core/alarms/alarm';

@Component({
  selector: 'app-reduced-from',
  templateUrl: './reduced-from.component.html',
  styleUrls: ['./reduced-from.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReducedFromComponent extends ItemDetailsPopup {

  nodes: any = {};

  constructor(private bell: BellNodesService) {
    super();
  }

  getNodes(reduction: any): any[] {
    if (this.nodes[reduction.obj.i] === undefined) {
      this.nodes[reduction.obj.i] = this.bell.getAllNodes(reduction);
    }
    return this.nodes[reduction.obj.i] || [];
  }

  public generateAlarm(node: any): Partial<Alarm> {
    const alarm: any = {
      itemId: node.itemId,
      icon: node.icon,
      duration: node.uptime / 60,
      mapId: node.mapId,
      zoneId: node.zoneid,
      areaId: node.areaid,
      type: node.type,
      coords: {
        x: node.coords[0],
        y: node.coords[1]
      },
      spawns: node.time,
      folklore: node.folklore,
      reduction: node.reduction,
      ephemeral: node.ephemeral,
      nodeContent: node.items,
      weathers: node.weathers,
      weathersFrom: node.weathersFrom,
      snagging: node.snagging,
      fishEyes: node.fishEyes,
      predators: node.predators || []
    };
    if (node.slot) {
      alarm.slot = +node.slot;
    }
    if (node.gig) {
      alarm.gig = node.gig;
    }
    if (node.baits) {
      alarm.baits = node.baits;
    }
    return alarm;
  }

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }

}
