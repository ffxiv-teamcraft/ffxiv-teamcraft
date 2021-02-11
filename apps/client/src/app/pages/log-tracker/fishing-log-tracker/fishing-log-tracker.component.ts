import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject } from 'rxjs';
import { TrackerComponent } from '../tracker-component';
import { fshLogOrder } from '../fsh-log-order';
import { fshSpearLogOrder } from '../fsh-spear-log-order';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { Alarm } from '../../../core/alarms/alarm';
import { uniqBy } from 'lodash';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-fishing-log-tracker',
  templateUrl: './fishing-log-tracker.component.html',
  styleUrls: ['./fishing-log-tracker.component.less']
})
export class FishingLogTrackerComponent extends TrackerComponent implements OnInit {

  private completion$ = this.authFacade.logTracking$.pipe(
    map(logTracking => logTracking.gathering),
    startWith([])
  );

  public type$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public display$: Observable<any[]>;

  public tabsDisplay$: Observable<any>;

  public pageDisplay$: Observable<any[]>;

  public spotId$: ReplaySubject<number> = new ReplaySubject<number>();

  public fshDataCache: Record<number, { gatheringNode: GatheringNode, alarms: Alarm[] }[]> = {};

  public loading = true;

  public hideCompleted = this.settings.hideCompletedLogEntries;

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private translate: TranslateService,
              private l12n: LocalizedDataService, protected alarmsFacade: AlarmsFacade, private lazyData: LazyDataService,
              private gatheringNodesService: GatheringNodesService, public settings: SettingsService) {
    super(alarmsFacade);
  }

  public getFshIcon(index: number): string {
    return [
      './assets/icons/angling.png',
      './assets/icons/spearfishing.png'
    ][index];
  }

  public markAsDone(itemId: number, done: boolean): void {
    this.authFacade.markAsDoneInLog('gathering', itemId, done);
  }

  public getFshData(itemId: number): { gatheringNode: GatheringNode, alarms: Alarm[] }[] {
    if (this.fshDataCache[itemId] === undefined) {
      this.fshDataCache[itemId] = this.gatheringNodesService.getItemNodes(itemId, true)
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

  ngOnInit(): void {
    const completeDisplay$ = of([this.lazyData.data.fishingLog, this.lazyData.data.spearFishingLog]).pipe(
      map((logs) => {
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
                data: this.getFshData(entry.itemId)
              };
              if (parameter) {
                fish.timed = parameter.timed;
                fish.weathered = parameter.weathered;
              }
              spot.fishes.push(fish);
            } else {
              const node = this.lazyData.data.spearFishingNodes.find(n => n.id === entry.itemId);
              const data = this.getFshData(node.itemId);
              spot.fishes.push({
                id: spot.id,
                itemId: node.itemId,
                level: node.level,
                icon: node.icon,
                data: data,
                timed: data[0].gatheringNode.limited
              });
            }
          });
          return display;
        });
      }),
      tap(() => this.loading = false),
      shareReplay(1)
    );

    this.display$ = combineLatest([completeDisplay$, this.completion$]).pipe(
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

    this.tabsDisplay$ = combineLatest([this.display$, this.type$]).pipe(
      map(([display, type]) => display[type])
    );

    this.pageDisplay$ = combineLatest([this.tabsDisplay$, this.spotId$]).pipe(
      map(([display, spotId]) => {
        const area = display.tabs.find(a => a.spots.some(spot => spot.id === spotId));
        if (area !== undefined) {
          return area.spots.find(spot => spot.id === spotId);
        }
        return null;
      })
    );
  }

}
