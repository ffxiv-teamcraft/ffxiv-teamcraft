import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { debounceTime, map, mergeMap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import * as nodePositions from '../../../core/data/sources/node-positions.json';
import { BellNodesService } from '../../../core/data/bell-nodes.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';

@Component({
  selector: 'app-gathering-location',
  templateUrl: './gathering-location.component.html',
  styleUrls: ['./gathering-location.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringLocationComponent {

  query$: Subject<string> = new Subject<string>();

  results$: Observable<any[]>;

  alarmsLoaded$: Observable<boolean>;

  alarms$: Observable<Alarm[]>;

  constructor(private dataService: DataService, private bell: BellNodesService, private alarmsFacade: AlarmsFacade) {

    this.alarmsLoaded$ = this.alarmsFacade.loaded$;

    this.alarms$ = this.alarmsFacade.allAlarms$;

    this.results$ = this.query$.pipe(
      debounceTime(500),
      mergeMap(query => this.dataService.searchGathering(query)),
      map(items => {
        const nodes = items.map(item => {
          return Object.keys(nodePositions)
            .filter(key => {
              return nodePositions[key].items.indexOf(item.obj.i) > -1;
            })
            .map(key => {
              return { ...item, ...nodePositions[key], nodeId: key };
            })
            .map(node => {
              const bellNode = this.bell.getNode(+node.nodeId);
              node.timed = bellNode !== undefined;
              if (node.timed) {
                const slotMatch = bellNode.items.find(nodeItem => nodeItem.id === item.obj.i);
                node.spawnTimes = bellNode.time;
                node.uptime = bellNode.uptime;
                if (slotMatch !== undefined) {
                  node.slot = slotMatch.slot;
                }
              }
              return node;
            });
        });
        const results = [].concat.apply([], nodes);

        //Once we have the resulting nodes, we need to remove the ones that appear twice or more for the same item.
        const finalNodes = [];
        results.forEach(row => {
          if (finalNodes.find(item => item.id === row.id && item.zoneid === row.zoneid) === undefined) {
            finalNodes.push(row);
          }
        });

        return finalNodes;
      })
    );
  }

  public getNodeDescription(node: any): string {
    const coords = `X: ${node.x}, Y: ${node.y}`;
    if (node.spawnTimes === undefined || node.spawnTimes.length === 0) {
      return coords;
    }
    return node.spawnTimes.reduce((res, current) => `${res}${current}:00 - ${(current + node.uptime / 60) % 24}:00 , `, `${coords} / `).slice(0, -2);
  }

  public addAlarms(node: any): void {
    const alarms: Alarm[] = node.spawnTimes.map(spawnTime => {
      const alarm = this.generateAlarm(node);
      alarm.spawn = spawnTime;
      return alarm;
    });
    this.alarmsFacade.addAlarms(alarms);
  }

  public canCreateAlarm(alarms: Alarm[], node: any): boolean {
    const generatedAlarm = this.generateAlarm(node);
    return alarms.find(alarm => {
      return alarm.itemId === generatedAlarm.itemId
        && alarm.zoneId === generatedAlarm.zoneId
        && alarm.areaId === generatedAlarm.areaId;
    }) === undefined;
  }

  private generateAlarm(node: any): Partial<Alarm> {
    return {
      itemId: node.obj.i,
      icon: node.obj.c,
      duration: node.uptime,
      zoneId: node.zoneid,
      areaId: node.areaid,
      slot: node.slot,
      coords: {
        x: node.x,
        y: node.y
      }
    };
  }

}
