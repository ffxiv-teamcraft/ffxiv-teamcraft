import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { BellNodesService } from '../../../core/data/bell-nodes.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { first, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject } from 'rxjs';
import { spearFishingNodes } from '../../../core/data/sources/spear-fishing-nodes';
import { spearFishingLog } from '../../../core/data/sources/spear-fishing-log';
import { TrackerComponent } from '../tracker-component';
import { fishEyes } from '../../../core/data/sources/fish-eyes';
import { fshLogOrder } from '../fsh-log-order';
import { fshSpearLogOrder } from '../fsh-spear-log-order';

@Component({
  selector: 'app-fishing-log-tracker',
  templateUrl: './fishing-log-tracker.component.html',
  styleUrls: ['./fishing-log-tracker.component.less']
})
export class FishingLogTrackerComponent extends TrackerComponent implements OnInit {

  private completion$ = this.authFacade.user$.pipe(
    map(user => user.gatheringLogProgression),
    startWith([])
  );

  public type$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public display$: Observable<any[]>;

  public tabsDisplay$: Observable<any>;

  public pageDisplay$: Observable<any[]>;

  public spotId$: ReplaySubject<number> = new ReplaySubject<number>();

  public fshDataCache: any[] = [];

  public loading = true;

  public fishEyesFormat = 1;

  public hideCompleted = false;

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private translate: TranslateService,
              private bell: BellNodesService, private l12n: LocalizedDataService, protected alarmsFacade: AlarmsFacade,
              private lazyData: LazyDataService) {
    super(alarmsFacade);
  }

  public getFshIcon(index: number): string {
    return [
      './assets/icons/angling.png',
      './assets/icons/spearfishing.png'
    ][index];
  }

  public toggleFishEyesFormat(): void {
    this.fishEyesFormat = this.fishEyesFormat === 1 ? 60 : 1;
  }

  public markAsDone(itemId: number, done: boolean): void {
    this.authFacade.user$.pipe(first()).subscribe(user => {
      if (done) {
        user.gatheringLogProgression.push(itemId);
      } else {
        user.gatheringLogProgression = user.gatheringLogProgression.filter(entry => entry !== itemId);
      }
      this.authFacade.updateUser(user);
    });
  }

  public getFshData(fish: any): any[] {
    if (this.fshDataCache[fish.itemId] === undefined) {
      this.fshDataCache[fish.itemId] = this._getFshData(fish);
    }
    return this.fshDataCache[fish.itemId];
  }

  private _getFshData(fish: any): any[] {
    const spots = this.gt.getFishingSpots(fish.itemId);
    if (fish.id >= 20000) {
      const logEntries = spearFishingLog.filter(entry => entry.itemId === fish.id);
      const spot = spearFishingNodes.find(node => node.itemId === fish.itemId);
      return logEntries
        .map(entry => {
          const result: any = {
            id: fish.id,
            zoneid: entry.zoneId,
            mapId: entry.mapId,
            x: entry.coords.x,
            y: entry.coords.y,
            level: entry.level,
            type: 4,
            itemId: fish.itemId,
            icon: fish.icon,
            timed: fish.spawn !== undefined
          };

          if (spot !== undefined) {
            result.gig = spot.gig;
          }

          if (spot.spawn !== undefined) {
            result.spawnTimes = [spot.spawn];
            result.uptime = spot.duration;
            // Just in case it despawns the day after.
            result.uptime = result.uptime < 0 ? result.uptime + 24 : result.uptime;
            // As uptimes are always in minutes, gotta convert to minutes here too.
            result.uptime *= 60;
          }

          if (spot.predator) {
            result.predators = spot.predator.map(predator => {
              const itemId = +Object.keys(this.lazyData.data.items).find(key => this.lazyData.data.items[key].en === predator.name);
              return {
                id: itemId,
                icon: this.lazyData.data.itemIcons[itemId],
                amount: predator.predatorAmount
              };
            });
          }
          return result;
        })
        .slice(0, 1);
    } else {
      if (spots.length > 0) {
        return spots
          .map(spot => {
            const mapId = this.l12n.getMapId(spot.zone);
            const zoneId = this.l12n.getAreaIdByENName(spot.title);
            if (mapId !== undefined) {
              const result: any = {
                id: fish.id,
                zoneid: zoneId,
                mapId: mapId,
                x: spot.coords[0],
                y: spot.coords[1],
                level: spot.lvl,
                type: 4,
                itemId: spot.id,
                icon: spot.icon,
                timed: spot.during !== undefined,
                fishEyes: spot.fishEyes || fishEyes[fish.itemId] !== undefined,
                snagging: spot.snagging
              };
              if (spot.during !== undefined) {
                result.spawnTimes = [spot.during.start];
                result.uptime = spot.during.end - spot.during.start;
                // Just in case it despawns the day after.
                result.uptime = result.uptime < 0 ? result.uptime + 24 : result.uptime;
                // As uptimes are always in minutes, gotta convert to minutes here too.
                result.uptime *= 60;
              }
              if (spot.predator) {
                result.predators = spot.predator.map(predator => {
                  return {
                    id: predator.id,
                    icon: predator.icon,
                    amount: predator.predatorAmount
                  };
                });
              }
              if (spot.hookset) {
                result.hookset = spot.hookset.split(' ')[0].toLowerCase();
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
              if (spot.transition) {
                result.weathersFrom = spot.transition.map(w => this.l12n.getWeatherId(w));
              }
              return result;
            }
            return undefined;
          })
          .filter(res => res !== undefined)
          .slice(0, 1);
      }
    }
    return null;
  }

  ngOnInit(): void {
    const completeDisplay$ = of([this.lazyData.data.fishingLog, spearFishingLog]).pipe(
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
                data: this.getFshData({ ...entry, id: entry.spot.id })
              };
              if (parameter) {
                fish.timed = parameter.timed;
                fish.weathered = parameter.weathered;
              }
              spot.fishes.push(fish);
            } else {
              const node = spearFishingNodes.find(n => n.id === entry.itemId);
              const data = this.getFshData(node);
              spot.fishes.push({
                id: spot.id,
                itemId: node.itemId,
                level: node.level,
                icon: node.icon,
                data: data,
                timed: data[0] && data[0].timed
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

    this.tabsDisplay$ = combineLatest(this.display$, this.type$).pipe(
      map(([display, type]) => display[type])
    );

    this.pageDisplay$ = combineLatest(this.tabsDisplay$, this.spotId$).pipe(
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
