import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { BellNodesService } from '../../../core/data/bell-nodes.service';
import { MapService } from '../../map/map.service';
import { StoredNode } from '../../list/model/stored-node';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Component({
  selector: 'app-gathered-by',
  templateUrl: './gathered-by.component.html',
  styleUrls: ['./gathered-by.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheredByComponent extends ItemDetailsPopup {

  @Input()
  showAlarmsIntegration = false;

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

  constructor(private alarmsFacade: AlarmsFacade, private mapService: MapService,
              private bell: BellNodesService, private lazyData: LazyDataService) {
    super();
  }

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }

  public addAlarm(alarm: Partial<Alarm>, group?: AlarmGroup): void {
    this.mapService.getMapById(alarm.mapId)
      .pipe(
        map((mapData) => {
          if (mapData !== undefined) {
            return this.mapService.getNearestAetheryte(mapData, alarm.coords);
          } else {
            return undefined;
          }
        }),
        map(aetheryte => {
          if (aetheryte !== undefined) {
            alarm.aetheryte = aetheryte;
          }
          return alarm;
        })
      ).subscribe((result: Alarm) => {
      if (group) {
        alarm.groupId = group.$key;
      }
      this.alarmsFacade.addAlarms(result);
    });
  }

  public canCreateAlarm(generatedAlarm: Partial<Alarm>): Observable<boolean> {
    return this.alarms$.pipe(
      map(alarms => {
        return !alarms.some(alarm => {
          return alarm.itemId === generatedAlarm.itemId
            && alarm.zoneId === generatedAlarm.zoneId;
        });
      })
    );
  }

  public generateAlarms(node: StoredNode): Partial<Alarm>[] {
    if (!node.uptime && !node.weathers) {
      return null;
    }
    const nodeData = this.lazyData.data.nodes[node.id];
    const coords = nodeData ? {
      x: nodeData.x,
      y: nodeData.y,
      z: nodeData.z
    } : {
      x: node.coords[0],
      y: node.coords[1],
      z: 0
    };
    const bellNodes = this.bell.getAllNodes({ obj: { i: this.item.id, c: this.item.icon } });
    const alarm: Partial<Alarm> = {
      duration: node.uptime / 60,
      zoneId: node.zoneid,
      mapId: node.mapid,
      spawns: node.time,
      weathers: node.weathers,
      weathersFrom: node.weathersFrom,
      snagging: node.snagging,
      predators: node.predators || [],
      coords: coords,
      icon: this.item.icon,
      itemId: this.item.id,
      type: this.details.type,
      reduction: false,
      ephemeral: node.limitType && node.limitType.en === 'Ephemeral'
    };
    const bellNode = bellNodes.find(n => n.zoneid === alarm.zoneId);
    if (bellNode) {
      alarm.nodeContent = bellNode.items;
      if (bellNode.folklore) {
        alarm.folklore = bellNode.folklore;
      }
    }
    if (node.slot) {
      alarm.slot = +node.slot;
    }
    if (node.gig) {
      alarm.gig = node.gig;
    }
    if (node.baits) {
      alarm.baits = node.baits;
    }
    return this.alarmsFacade.applyFishEyes(alarm);
  }

  trackByAlarm(index: number, alarm: Partial<Alarm>): string {
    return `${JSON.stringify(alarm.spawns)}:${JSON.stringify(alarm.weathers)}`;
  }

}
