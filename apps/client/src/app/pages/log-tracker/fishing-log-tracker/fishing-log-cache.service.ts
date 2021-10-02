import { Injectable } from '@angular/core';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { Alarm } from '../../../core/alarms/alarm';
import { uniqBy } from 'lodash';
import { combineLatest } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { fshSpearLogOrder } from '../fsh-spear-log-order';
import { fshLogOrder } from '../fsh-log-order';

@Injectable({
  providedIn: 'root'
})
export class FishingLogCacheService {

  private minBtnSpearNodes: GatheringNode[];

  private completion$ = this.authFacade.logTracking$.pipe(
    map(logTracking => logTracking.gathering),
    startWith([])
  );

  private completeDisplay$ = this.lazyData.data$.pipe(
    map(data => {
      return [data.fishingLog, data.spearFishingLog];
    }),
    filter(logs => logs.every(l => !!l)),
    map((logs) => {
      if (!this.minBtnSpearNodes) {
        this.minBtnSpearNodes = Object.entries<any>(this.lazyData.data.nodes)
          .map(([key, value]) => {
            const res = {
              ...value,
              id: +key,
              zoneId: value.zoneid
            };
            delete res.zoneid;
            return res;
          });
      }
      return logs.map((log: any[], type) => {
        const display = { tabs: [], total: 0, done: 0 };
        log.forEach(entry => {
          let row = display.tabs.find(e => e.mapId === entry.mapId);
          if (row === undefined) {
            display.tabs.push({
              mapId: entry.mapId,
              placeId: entry.placeId,
              done: 0,
              total: 0,
              spots: []
            });
            row = display.tabs[display.tabs.length - 1];
          }
          const spotId = entry.spot ? entry.spot.id : entry.id;
          let spot = row.spots.find(s => s.id === spotId);
          if (spot === undefined) {
            const coords = entry.spot ? entry.spot.coords : entry.coords;
            row.spots.push({
              id: spotId,
              placeId: entry.zoneId,
              mapId: entry.mapId,
              done: 0,
              total: 0,
              coords: coords,
              fishes: []
            });
            spot = row.spots[row.spots.length - 1];
          }
          if (type === 0) {
            const parameter = this.lazyData.data.fishParameter[entry.id];
            const fish: any = {
              id: spot.id,
              itemId: entry.itemId,
              level: entry.level,
              icon: entry.icon,
              data: this.getFshData(entry.itemId, spot.id)
            };
            if (parameter) {
              fish.timed = parameter.timed;
              fish.weathered = parameter.weathered;
            }
            spot.fishes.push(fish);
          } else {
            const node = this.minBtnSpearNodes.find(n => n.items.includes(entry.itemId));
            const data = this.getFshData(entry.itemId, spot.id);
            if (!node) {
              console.log(entry);
            }
            spot.fishes.push({
              id: spot.id,
              itemId: entry.itemId,
              level: node.level,
              data: data,
              timed: data[0].gatheringNode.limited,
              tug: data[0].gatheringNode.tug
            });
          }
        });
        return display;
      });
    }),
    shareReplay(1)
  );

  public display$ = combineLatest([this.completeDisplay$, this.completion$]).pipe(
    map(([completeDisplay, completion]: [any, number[]]) => {
      return completeDisplay.map(display => {
        const uniqueDisplayDone = [];
        const uniqueDisplayTotal = [];
        display.tabs.forEach(area => {
          const uniqueMapDone = [];
          const uniqueMapTotal = [];
          area.spots.forEach(spot => {
            const uniqueSpotDone = [];
            const uniqueSpotTotal = [];
            spot.fishes.forEach(fish => {
              fish.done = completion.indexOf(fish.itemId) > -1;
              if (uniqueMapTotal.indexOf(fish.itemId) === -1) {
                uniqueMapTotal.push(fish.itemId);
              }
              if (uniqueDisplayTotal.indexOf(fish.itemId) === -1) {
                uniqueDisplayTotal.push(fish.itemId);
              }
              if (uniqueSpotTotal.indexOf(fish.itemId) === -1) {
                uniqueSpotTotal.push(fish.itemId);
              }
              if (fish.done) {
                if (uniqueDisplayDone.indexOf(fish.itemId) === -1) {
                  uniqueDisplayDone.push(fish.itemId);
                }
                if (uniqueMapDone.indexOf(fish.itemId) === -1) {
                  uniqueMapDone.push(fish.itemId);
                }
                if (uniqueSpotDone.indexOf(fish.itemId) === -1) {
                  uniqueSpotDone.push(fish.itemId);
                }
              }
            });
            spot.total = uniqueSpotTotal.length;
            spot.done = uniqueSpotDone.length;
          });
          area.spots = area.spots
            .sort((a, b) => {
              if (a.id > 20000) {
                return fshSpearLogOrder.indexOf(this.l12n.getPlace(a.placeId).en) - fshSpearLogOrder.indexOf(this.l12n.getPlace(b.placeId).en);
              }
              return fshLogOrder.indexOf(this.l12n.getPlace(a.placeId).en) - fshLogOrder.indexOf(this.l12n.getPlace(b.placeId).en);
            });
          area.total = uniqueMapTotal.length;
          area.done = uniqueMapDone.length;
        });
        display.tabs = display.tabs
          .sort((a, b) => {
            if (a.id > 20000) {
              return fshSpearLogOrder.indexOf(this.l12n.getPlace(a.placeId).en) - fshSpearLogOrder.indexOf(this.l12n.getPlace(b.placeId).en);
            }
            return fshLogOrder.indexOf(this.l12n.getPlace(a.placeId).en) - fshLogOrder.indexOf(this.l12n.getPlace(b.placeId).en);
          });
        display.total = uniqueDisplayTotal.length;
        display.done = uniqueDisplayDone.length;
        return display;
      });
    }),
    shareReplay(1)
  );

  private fshDataCache: Record<number, { gatheringNode: GatheringNode, alarms: Alarm[] }[]> = {};

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private l12n: LocalizedDataService, protected alarmsFacade: AlarmsFacade,
              private lazyData: LazyDataService, private gatheringNodesService: GatheringNodesService) {
  }


  private getFshData(itemId: number, spotId: number): { gatheringNode: GatheringNode, alarms: Alarm[] }[] {
    if (this.fshDataCache[itemId] === undefined) {
      this.fshDataCache[itemId] = this.gatheringNodesService.getItemNodes(itemId, true)
        .filter(node => node.id === spotId)
        .map(node => {
          return {
            gatheringNode: node,
            alarms: this.alarmsFacade.generateAlarms(node)
          };
        });

      this.fshDataCache[itemId] = uniqBy(this.fshDataCache[itemId], entry => entry.gatheringNode.baits && entry.gatheringNode.baits[0]);
    }
    return this.fshDataCache[itemId];
  }

}
