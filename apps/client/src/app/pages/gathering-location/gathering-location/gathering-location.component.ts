import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { debounceTime, map, mergeMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import * as nodePositions from '../../../core/data/sources/node-positions.json';
import { BellNodesService } from '../../../core/data/bell-nodes.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { MapService } from '../../../modules/map/map.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';

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

  loading = false;

  showIntro = true;

  constructor(private dataService: DataService, private bell: BellNodesService, private alarmsFacade: AlarmsFacade,
              private mapService: MapService, private l12n: LocalizedDataService) {

    this.alarmsLoaded$ = this.alarmsFacade.loaded$;

    this.alarms$ = this.alarmsFacade.allAlarms$;

    this.results$ = this.query$.pipe(
      debounceTime(500),
      tap(() => {
        this.showIntro = false;
        this.loading = true;
      }),
      mergeMap(query => this.dataService.searchGathering(query)),
      map(items => {
        const nodesFromPositions = [].concat.apply(items.map(item => {
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
                node.type = ['Rocky Outcropping', 'Mineral Deposit', 'Mature Tree', 'Lush Vegetation'].indexOf(bellNode.type);
                const slotMatch = bellNode.items.find(nodeItem => nodeItem.id === item.obj.i);
                node.spawnTimes = bellNode.time;
                node.uptime = bellNode.uptime;
                if (slotMatch !== undefined) {
                  node.slot = slotMatch.slot;
                }
              }
              return node;
            });
        }));
        const nodesFromGarlandBell = items
          .map(item => {
            return [].concat.apply([],
              this.bell.getNodesByItemId(item.obj.i)
                .map(node => {
                  const slotMatch = node.items.find(nodeItem => nodeItem.id === item.obj.i);
                  return {
                    ...item,
                    nodeId: node.id,
                    zoneid: this.l12n.getAreaIdByENName(node.zone),
                    x: node.coords[0],
                    y: node.coords[1],
                    level: node.lvl,
                    itemId: item.obj.i,
                    spawnTimes: node.time,
                    uptime: node.uptime,
                    slot: slotMatch.slot,
                    timed: true
                  };
                })
            );
          });

        const results = [].concat.apply([], nodesFromPositions.concat(nodesFromGarlandBell));

        //Once we have the resulting nodes, we need to remove the ones that appear twice or more for the same item.
        const finalNodes = [];
        results.forEach(row => {
          if (finalNodes.find(node => node.obj.i === row.obj.i && node.zoneid === row.zoneid) === undefined) {
            finalNodes.push(row);
          }
        });

        return finalNodes;
      }),
      tap(() => this.loading = false)
    );
  }

  public getNodeSpawns(node: any): string {
    if (node.spawnTimes === undefined || node.spawnTimes.length === 0) {
      return '';
    }
    return node.spawnTimes.reduce((res, current) => `${res}${current}:00 - ${(current + node.uptime / 60) % 24}:00, `, ``).slice(0, -2);
  }

  public addAlarm(node: any): void {
    const alarm: Partial<Alarm> = this.generateAlarm(node);
    alarm.spawns = node.spawnTimes;
    this.mapService.getMapById(alarm.zoneId)
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
      this.alarmsFacade.addAlarms(result);
    });
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
      duration: node.uptime / 60,
      zoneId: node.zoneid,
      areaId: node.areaid,
      slot: +node.slot,
      type: node.type,
      coords: {
        x: node.x,
        y: node.y
      }
    };
  }

}
