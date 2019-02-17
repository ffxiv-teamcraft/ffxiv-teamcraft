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
import { folklores } from '../../../core/data/sources/folklores';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { reductions } from '../../../core/data/sources/reductions';

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

  compactDisplay = false;

  constructor(private dataService: DataService, private bell: BellNodesService, private alarmsFacade: AlarmsFacade,
              private mapService: MapService, private l12n: LocalizedDataService, private gt: GarlandToolsService) {

    this.alarmsLoaded$ = this.alarmsFacade.loaded$;

    this.alarms$ = this.alarmsFacade.allAlarms$;

    this.compactDisplay = localStorage.getItem('gathering-location:compact') === 'true';

    this.results$ = this.query$.pipe(
      debounceTime(500),
      tap(() => {
        this.showIntro = false;
        this.loading = true;
      }),
      mergeMap(query => this.dataService.searchGathering(query)),
      map(items => {
        const nodesFromPositions = [].concat.apply([], items.map(item => {
          const availableNodeIds = item.nodes && item.nodes.length > 0 ? item.nodes : Object.keys(nodePositions)
            .filter(key => {
              return nodePositions[key].items.indexOf(item.obj.i) > -1;
            });
          return availableNodeIds
            .map(key => {
              return { ...item, ...nodePositions[key], nodeId: key };
            })
            .map(node => {
              const bellNode = this.bell.getNode(+node.nodeId);
              node.timed = bellNode !== undefined;
              node.itemId = node.obj.i;
              node.icon = item.obj.c;
              if (node.timed) {
                node.type = ['Rocky Outcropping', 'Mineral Deposit', 'Mature Tree', 'Lush Vegetation'].indexOf(bellNode.type);
                const slotMatch = bellNode.items.find(nodeItem => nodeItem.id === item.obj.i);
                node.spawnTimes = bellNode.time;
                node.uptime = bellNode.uptime;
                if (slotMatch !== undefined) {
                  node.slot = slotMatch.slot;
                }
              }
              node.hidden = !node.items.some(itemId => itemId === node.itemId);
              node.mapId = node.map;
              const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(item.obj.i) > -1);
              if (folklore !== undefined) {
                node.folklore = {
                  id: +folklore,
                  icon: [7012, 7012, 7127, 7127, 7128, 7128][node.type]
                };
              }
              return node;
            });
        }));

        const nodesFromGarlandBell = [].concat.apply([], items
          .map(item => {
            return [].concat.apply([],
              [item.obj.i, ...reductions[item.obj.i]].map(itemId => {
                return this.bell.getNodesByItemId(itemId)
                  .map(node => {
                    const nodePosition = nodePositions[node.id];
                    const result = {
                      ...item,
                      nodeId: node.id,
                      zoneid: this.l12n.getAreaIdByENName(node.zone),
                      mapId: nodePosition ? nodePosition.map : this.l12n.getAreaIdByENName(node.zone),
                      x: node.coords[0],
                      y: node.coords[1],
                      level: node.lvl,
                      type: node.type,
                      itemId: node.itemId,
                      icon: node.icon,
                      spawnTimes: node.time,
                      uptime: node.uptime,
                      slot: node.slot,
                      timed: true,
                      reduction: reductions[item.obj.i] && reductions[item.obj.i].indexOf(node.itemId) > -1,
                      ephemeral: node.name === 'Ephemeral'
                    };
                    const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(item.obj.i) > -1);
                    if (folklore !== undefined) {
                      result.folklore = {
                        id: +folklore,
                        icon: [7012, 7012, 7127, 7127, 7128, 7128][node.type]
                      };
                    }
                    return result;
                  });
              })
            );
          })
        );

        const nodesFromFishing = [].concat.apply([], ...items.map(item => {
          const spots = this.gt.getFishingSpots(item.obj.i);
          if (spots.length > 0) {
            return spots.map(spot => {
              const mapId = this.l12n.getMapId(spot.zone);
              const zoneId = this.l12n.getAreaIdByENName(spot.title);
              if (mapId !== undefined) {
                const result = {
                  ...item,
                  zoneid: zoneId,
                  mapId: mapId,
                  x: spot.coords[0],
                  y: spot.coords[1],
                  level: spot.lvl,
                  type: 4,
                  itemId: spot.id,
                  icon: spot.icon,
                  timed: spot.during !== undefined
                };
                if (spot.during !== undefined) {
                  result.spawnTimes = [spot.during.start];
                  result.uptime = spot.during.end - spot.during.start;
                  // Just in case it despawns the day after.
                  result.uptime = result.uptime < 0 ? result.uptime + 24 : result.uptime;
                  // As uptimes are always in minutes, gotta convert to minutes here too.
                  result.uptime *= 60;
                }
                result.baits = spot.bait.map(bait => {
                  const baitData = this.gt.getBait(bait);
                  return {
                    icon: baitData.icon,
                    id: baitData.id
                  };
                });
                if (spot.weather) {
                  result.weathers = spot.weather.map(w => this.l12n.getWeatherId(w));
                }
                return result;
              }
              return undefined;
            })
              .filter(res => res !== undefined);
          }
          return [];
        }).filter(res => res !== undefined));

        const results = [...nodesFromGarlandBell,
          ...nodesFromPositions,
          ...nodesFromFishing];

        //Once we have the resulting nodes, we need to remove the ones that appear twice or more for the same item.
        const finalNodes = [];
        results
          .sort((a, b) => {
            if (a.ephemeral && !b.ephemeral) {
              return -1;
            } else if (b.ephemeral && !a.ephemeral) {
              return 1;
            }
            return 0;
          })
          .forEach(row => {
            if (!finalNodes.some(node => node.itemId === row.itemId && node.zoneid === row.zoneid && node.type === row.type)) {
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
    alarm.mapId = node.mapId;
    alarm.baits = node.baits;
    alarm.weathers = node.weathers;
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

  public saveCompactDisplay(value: boolean): void {
    localStorage.setItem('gathering-location:compact', value.toString());
  }

  private generateAlarm(node: any): Partial<Alarm> {
    return {
      itemId: node.itemId,
      icon: node.icon,
      duration: node.uptime / 60,
      zoneId: node.zoneid,
      areaId: node.areaid,
      slot: +node.slot,
      type: node.type,
      coords: {
        x: node.x,
        y: node.y
      },
      folklore: node.folklore,
      reduction: node.reduction,
      ephemeral: node.ephemeral
    };
  }

}
