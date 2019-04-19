import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Alarm } from '../../../../core/alarms/alarm';
import { StoredNode } from '../../../../modules/list/model/stored-node';

@Component({
  selector: 'app-gathered-by',
  templateUrl: './gathered-by.component.html',
  styleUrls: ['./gathered-by.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheredByComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }


  public generateAlarm(node: StoredNode): Partial<Alarm> {
    const alarm: Partial<Alarm> = {
      duration: node.uptime / 60,
      zoneId: node.zoneid,
      areaId: node.areaid,
      mapId: node.mapid,
      spawns: node.time,
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

}
