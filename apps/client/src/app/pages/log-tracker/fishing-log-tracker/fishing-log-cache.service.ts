import { Injectable } from '@angular/core';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { Alarm } from '../../../core/alarms/alarm';
import { uniqBy } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { fshSpearLogOrder } from '../fsh-spear-log-order';
import { fshLogOrder } from '../fsh-log-order';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Injectable({
  providedIn: 'root'
})
export class FishingLogCacheService {

  private completion$ = this.authFacade.logTracking$.pipe(
    map(logTracking => logTracking.gathering),
    startWith([])
  );

  private completeDisplay$ = combineLatest([
    this.lazyData.getMinBtnSpearNodesIndex(),
    this.lazyData.getEntry('fishingLog'),
    this.lazyData.getEntry('spearFishingLog')
  ]).pipe(
    map(([minBtnSpearNodes, fishingLog, spearFishingLog]) => {
      const fishingLogData$ = combineLatest(fishingLog.map(entry => {
        return combineLatest([
          this.lazyData.getRow('fishParameter', entry.itemId),
          this.getFshData(entry.itemId, entry.spot.id)
        ]).pipe(
          map(([parameter, fshData]) => {
            const fish: any = {
              id: entry.spot,
              itemId: entry.itemId,
              level: entry.level,
              icon: entry.icon,
              data: fshData
            };
            if (parameter) {
              fish.timed = parameter.timed;
              fish.weathered = parameter.weathered;
            }
            return fish;
          })
        );
      }));

      const spearFishingLogData$ = combineLatest(spearFishingLog.map(entry => {
        const spot = minBtnSpearNodes.find(n => n.items.includes(entry.itemId));
        return combineLatest([
          this.lazyData.getRow('fishParameter', entry.itemId),
          this.getFshData(entry.itemId, spot.id)
        ]).pipe(
          map(([parameter, fshData]) => {
            const data = this.getFshData(entry.itemId, spot.id);
            return {
              id: spot.id,
              itemId: entry.itemId,
              level: spot.level,
              data: data,
              timed: data[0].gatheringNode.limited,
              tug: data[0].gatheringNode.tug
            };
          })
        );
      }));
      return combineLatest([fishingLogData$, spearFishingLogData$]).pipe(
        map(([fishingFish, spearFishingFish]) => {
          return [...fishingFish, spearFishingFish].reduce((display, entry) => {
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
            spot.fishes.push(entry);
            return display;
          }, { tabs: [], total: 0, done: 0 });
        })
      );
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

  private fshDataCache: Record<number, Observable<{ gatheringNode: GatheringNode, alarms: Alarm[] }[]>> = {};

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private l12n: LocalizedDataService, protected alarmsFacade: AlarmsFacade,
              private lazyData: LazyDataFacade, private gatheringNodesService: GatheringNodesService) {
  }


  private getFshData(itemId: number, spotId: number): Observable<{ gatheringNode: GatheringNode, alarms: Alarm[] }[]> {
    if (this.fshDataCache[itemId] === undefined) {
      this.fshDataCache[itemId] = this.gatheringNodesService.getItemNodes(itemId, true)
        .pipe(
          map(nodes => {
            return uniqBy(nodes.filter(node => node.id === spotId)
              .map(node => {
                return {
                  gatheringNode: node,
                  alarms: this.alarmsFacade.generateAlarms(node)
                };
              }), entry => entry.gatheringNode.baits && entry.gatheringNode.baits[0]);
          })
        );
    }
    return this.fshDataCache[itemId];
  }

}
