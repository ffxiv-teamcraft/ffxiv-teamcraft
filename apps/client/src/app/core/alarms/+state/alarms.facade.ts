import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { AlarmsState } from './alarms.reducer';
import { alarmsQuery } from './alarms.selectors';
import {
  AddAlarms,
  AddAlarmsAndGroup,
  AssignGroupToAlarm,
  CreateAlarmGroup,
  DeleteAlarmGroup,
  DeleteAllAlarms,
  LoadAlarmGroup,
  LoadAlarms,
  PureUpdateAlarm,
  RemoveAlarm,
  SetAlarmDone,
  SetAlarms,
  SetGroups,
  UpdateAlarm,
  UpdateAlarmGroup
} from './alarms.actions';
import { Alarm } from '../alarm';
import { filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { AlarmDisplay } from '../alarm-display';
import { EorzeanTimeService } from '../../eorzea/eorzean-time.service';
import { AlarmsPageDisplay } from '../alarms-page-display';
import { AlarmGroupDisplay } from '../alarm-group-display';
import { AlarmGroup } from '../alarm-group';
import { SettingsService } from '../../../modules/settings/settings.service';
import { WeatherService } from '../../eorzea/weather.service';
import { NextSpawn } from '../next-spawn';
import { mapIds } from '../../data/sources/map-ids';
import { GatheringNode } from '../../data/model/gathering-node';
import { MapService } from '../../../modules/map/map.service';
import { GatheringNodesService } from '../../data/gathering-nodes.service';
import * as semver from 'semver';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { environment } from '../../../../environments/environment';
import { Actions } from '@ngrx/effects';
import { TimeUtils } from '../time.utils';
import { safeCombineLatest } from '../../rxjs/safe-combine-latest';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { XivapiPatch } from '../../data/model/xivapi-patch';
import { UpdateData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AlarmsFacade {

  regenerating = false;

  loaded$ = this.store.pipe(select(alarmsQuery.getLoaded));

  allAlarms$ = this.store.pipe(
    select(alarmsQuery.getAllAlarms),
    map(alarms => {
      if (this.regenerating) {
        return [null];
      }
      if (environment.production && alarms[0] && semver.ltr(alarms[0].appVersion || '6.0.0', '8.6.0')) {
        this.regenerateAlarms(alarms);
        return [null];
      }
      return alarms;
    }),
    filter(alarms => alarms.length === 0 || !!alarms[0]),
    shareReplay(1)
  );

  allGroups$ = this.store.pipe(select(alarmsQuery.getAllGroups));

  externalGroup$ = this.store.pipe(select(alarmsQuery.getExternalGroup));

  externalGroupAlarms$ = this.store.pipe(select(alarmsQuery.getExternalGroupAlarms));

  alarmsPageDisplay$ = combineLatest([this.allAlarms$, this.allGroups$]).pipe(
    map(([alarms, groups]) => {
      return {
        groupedAlarms: groups
          .sort((a, b) => {
            if (a.index === b.index) {
              return a.name < b.name ? -1 : 1;
            }
            return a.index < b.index ? -1 : 1;
          })
          .map(group => {
            return {
              group: group,
              alarms: group.alarms.map(key => alarms.find(a => a.$key === key)).filter(a => !!a)
            };
          }),
        noGroup: alarms.filter(alarm => !groups.some(group => group.alarms.includes(alarm.$key)))
      };
    }),
    switchMap(preparedDisplay => {
      return this.etime.getEorzeanTime().pipe(
        map(date => {
          const display = new AlarmsPageDisplay();
          display.groupedAlarms = preparedDisplay.groupedAlarms
            .map(groupData => {
              return new AlarmGroupDisplay(groupData.group, this.createDisplayArray(groupData.alarms, date));
            });

          display.noGroup = this.createDisplayArray(preparedDisplay.noGroup, date);
          return display;
        })
      );
    }),
    shareReplay(1)
  );

  alarmsSidebarDisplay$ = combineLatest([this.allAlarms$, this.allGroups$]).pipe(
    map(([alarms, groups]) => {
      return alarms
        .map(alarm => {
          const alarmGroups = groups.filter(g => g.alarms.some(key => key === alarm.$key));
          alarm.groupNames = alarmGroups.map(g => g.name).join(', ');
          if (!alarm.enabled || (alarmGroups?.length > 0 && alarmGroups.every(g => !g.enabled))) {
            return null;
          }
          return alarm;
        })
        .filter(alarm => !!alarm);
    }),
    switchMap(alarms => {
      return this.etime.getEorzeanTime().pipe(
        map(date => this.createDisplayArray(alarms, date))
      );
    }),
    shareReplay(1)
  );

  private nextSpawnCache: any = {};

  private itemPatch: LazyData['itemPatch'];

  private patches: XivapiPatch[] = [];

  private legendaryFish: LazyData['legendaryFish'];

  constructor(private actions$: Actions, private store: Store<{ alarms: AlarmsState }>, private etime: EorzeanTimeService,
              private settings: SettingsService, private weatherService: WeatherService,
              private lazyData: LazyDataFacade, private mapService: MapService,
              private gatheringNodesService: GatheringNodesService, private progressService: ProgressPopupService) {
  }

  public addAlarms(...alarms: Alarm[]): void {
    this.store.dispatch(new AddAlarms(alarms));
  }

  public addAlarmInGroup(alarm: Alarm, group?: AlarmGroup): void {
    this.store.dispatch(new AddAlarms([alarm], group));
  }

  public addAlarmsAndGroup(alarms: Alarm[], groupName: string, redirect = false): void {
    this.store.dispatch(new AddAlarmsAndGroup(alarms, groupName, redirect));
  }

  public updateAlarm(alarm: Alarm): void {
    this.store.dispatch(new UpdateAlarm(alarm));
  }

  public deleteAlarm(alarm: Alarm): void {
    this.store.dispatch(new RemoveAlarm(alarm.$key));
  }

  public createGroup(name: string, index: number): void {
    this.store.dispatch(new CreateAlarmGroup(name, index));
  }

  public updateGroup(group: AlarmGroup): void {
    this.store.dispatch(new UpdateAlarmGroup(group));
  }

  public deleteGroup(key: string): void {
    this.store.dispatch(new DeleteAlarmGroup(key));
  }

  public assignAlarmGroup(alarmId: string, groupKey: string): void {
    this.store.dispatch(new AssignGroupToAlarm(alarmId, groupKey));
  }

  public loadExternalGroup(key: string): void {
    this.store.dispatch(new LoadAlarmGroup(key));
  }

  public deleteAllAlarms(): void {
    this.store.dispatch(new DeleteAllAlarms());
  }

  /**
   * Only one alarm can be added for each item.
   * @param alarm
   */
  public hasAlarm(alarm: Partial<Alarm>): Observable<boolean> {
    return this.getRegisteredAlarm(alarm).pipe(map(a => a !== undefined));
  }

  public getRegisteredAlarm(alarm: Partial<Alarm>): Observable<Alarm> {
    return this.allAlarms$.pipe(
      map(alarms => alarms.find(a => {
        if (alarm.itemId) {
          return a.itemId === alarm.itemId
            && a.zoneId === alarm.zoneId
            && a.type === alarm.type
            && a.fishEyes === alarm.fishEyes
            && a.nodeId === alarm.nodeId;
        } else if (alarm.type === -10) {
          return a.bnpcName === alarm.bnpcName;
        } else {
          // If it's a custom alarm
          return a.name === alarm.name && a.duration === alarm.duration && a.type === alarm.type;
        }
      }))
    );
  }

  public loadAlarms(): void {
    this.store.dispatch(new LoadAlarms());
    combineLatest([
      this.lazyData.getEntry('itemPatch'),
      this.lazyData.patches$,
      this.lazyData.getEntry('legendaryFish')
    ]).pipe(
      first()
    ).subscribe(([itemPatch, patches, legendaryFish]) => {
      this.itemPatch = itemPatch;
      this.patches = patches;
      this.legendaryFish = legendaryFish;
    });
  }

  public createDisplay(alarm: Alarm, date: Date): AlarmDisplay {
    const display = new AlarmDisplay(alarm);
    const nextSpawn = { ...this.getNextSpawn(alarm, date) };
    display.spawned = this.isSpawned(alarm, date);
    display.played = this.isPlayed(alarm, date);
    display.groupNames = alarm.groupNames || '';
    if (Math.abs(alarm.type) < 4) {
      display.dbType = 'node';
    } else if (alarm.type === 4) {
      display.dbType = 'spearfishing-spot';
    } else {
      display.dbType = 'fishing-spot';
    }
    if (display.spawned) {
      const despawn = {
        ...nextSpawn
      };
      if (nextSpawn.despawn) {
        despawn.hours = nextSpawn.despawn;
      } else {
        despawn.hours = (nextSpawn.hours + alarm.duration) % 24;
      }
      display.remainingTime = this.getMinutesBefore(date, despawn);
    } else {
      display.remainingTime = this.getMinutesBefore(date, nextSpawn);
    }
    display.remainingTime = this.etime.toEarthTime(display.remainingTime);
    display.nextSpawn = nextSpawn;
    display.weather = nextSpawn.weather;
    return display;
  }

  public createDisplayArray(alarms: Alarm[], date: Date): AlarmDisplay[] {
    return this.sortAlarmDisplays(alarms.filter(alarm => alarm.spawns !== undefined || alarm.weathers !== undefined)
      .map(alarm => {
        return this.createDisplay(alarm, date);
      }));
  }

  public getNextSpawn(alarm: Alarm, etime: Date): NextSpawn {
    const cacheKey = `${alarm.itemId}-${alarm.bnpcName}-${alarm.zoneId}-${(alarm.spawns || []).join(',')}-${(alarm.weathers || []).join(',')}`;
    if (this.nextSpawnCache[cacheKey] === undefined || this.nextSpawnCache[cacheKey].expires.getTime() < Date.now()) {
      const sortedSpawns = [...(alarm.spawns || [])].sort((a, b) => {
        const timeBeforeA = this.getMinutesBefore(etime, { hours: a, days: 0 });
        const timeBeforeADespawns = this.getMinutesBefore(etime, { hours: (a + alarm.duration) % 24, days: 0 });
        const timeBeforeB = this.getMinutesBefore(etime, { hours: b, days: 0 });
        const timeBeforeBDespawns = this.getMinutesBefore(etime, { hours: (b + alarm.duration) % 24, days: 0 });
        // If time before next spawn is greater than time before next despawn, this node is spawned !
        if (timeBeforeADespawns < timeBeforeA) {
          return -1;
        }
        if (timeBeforeBDespawns < timeBeforeB) {
          return 1;
        }
        // Else just compare remaining time.
        return timeBeforeA < timeBeforeB ? -1 : 1;
      });
      if (alarm.weathers && alarm.weathers?.length > 0) {
        const spawn = this.findWeatherSpawnCombination({ ...alarm }, sortedSpawns, etime.getTime());
        if (spawn === null) {
          console.error('No spawn found for alarm');
          console.log(alarm);
        }
        this.nextSpawnCache[cacheKey] = {
          spawn: spawn,
          expires: this.etime.toEarthDate(etime)
        };
      } else {
        this.nextSpawnCache[cacheKey] = {
          spawn: {
            hours: sortedSpawns[0],
            days: 0,
            despawn: (sortedSpawns[0] + alarm.duration) % 24
          },
          expires: new Date()
        };
      }
    }
    return this.nextSpawnCache[cacheKey].spawn;
  }

  /**
   * Get the amount of minutes before a given hour happens.
   * @param currentTime
   * @param spawn
   * @param minutes
   */
  public getMinutesBefore(currentTime: Date, spawn: NextSpawn, minutes = 0): number {
    if (spawn.date) {
      const durationSeconds = Math.floor((spawn.date.getTime() - currentTime.getTime()) / 1000);
      if (durationSeconds >= 0) {
        return durationSeconds / 60;
      }
    }
    let hours = spawn.hours;
    // Convert 0 to 24 for spawn timers
    if (hours === 0) {
      hours = 24;
    }
    const resHours = (hours - currentTime.getUTCHours()) % 24;
    let resMinutes = resHours * 60 + minutes - currentTime.getUTCMinutes();
    let resSeconds = resHours * 3600 + minutes * 60 - currentTime.getUTCSeconds();
    if (resMinutes < 0) {
      resMinutes += 1440;
    }
    if (resSeconds < 0) {
      resSeconds += 360;
    }
    resMinutes += (resSeconds % 60) / 60;
    return resMinutes + (spawn.days * 1440);
  }

  public generateAlarms(node: GatheringNode): Alarm[] {
    // If no spawns and no weather, no alarms.
    if (!node?.spawns?.length && !node?.weathers?.length) {
      return [];
    }
    const alarm: Partial<Alarm> = {
      itemId: node.matchingItemId,
      nodeId: node.id,
      duration: node.duration ? node.duration / 60 : 0,
      mapId: node.map,
      zoneId: mapIds.find((m) => m.id === node.map)?.zone || node.zoneId,
      areaId: node.zoneId,
      type: node.type,
      coords: {
        x: node.x,
        y: node.y,
        z: node.z || 0
      },
      spawns: node.spawns,
      folklore: node?.folklore,
      reduction: node.isReduction || false,
      ephemeral: node.ephemeral || false,
      nodeContent: node.items,
      weathers: node.weathers || [],
      weathersFrom: node.weathersFrom || [],
      snagging: node.snagging || false,
      predators: node.predators || [],
      note: '',
      enabled: true
    };
    if (node.speed) {
      alarm.speed = node.speed;
      alarm.shadowSize = node.shadowSize;
    }
    if (node.baits) {
      alarm.baits = node.baits;
    }
    if (node.hookset) {
      alarm.hookset = node.hookset;
    }
    return this.applyFishEyes(alarm) as Alarm[];
  }

  public regenerateAlarm(alarm: Partial<Alarm>): Observable<Alarm> {
    return this.gatheringNodesService.getItemNodes(alarm.itemId).pipe(
      map(nodes => {
        const nodeForThisAlarm = nodes.find(n => {
          if (alarm.nodeId) {
            return n.id === alarm.nodeId;
          }
          return alarm.mapId === n.map;
        }) || nodes[0];
        if (nodeForThisAlarm) {
          const alarms = this.generateAlarms(nodeForThisAlarm);
          const regenerated = alarms.find(a => a.fishEyes === alarm.fishEyes) || alarms[0];
          if (!regenerated) {
            return null;
          }
          regenerated.userId = alarm.userId;
          regenerated.$key = alarm.$key;
          regenerated.appVersion = environment.version;
          regenerated.enabled = alarm.enabled;
          return regenerated;
        }
      })
    );
  }

  public regenerateAlarms(_alarms?: Alarm[]): void {
    let alarms$ = of(_alarms);
    if (!_alarms) {
      alarms$ = this.allAlarms$;
    }
    const operation$ = safeCombineLatest([alarms$, this.allGroups$]).pipe(
      first(),
      switchMap(([alarms, groups]) => {
        this.regenerating = true;
        const newGroups = groups.map(group => {
          const clone = new AlarmGroup(group.name, group.index);
          clone.userId = group.userId;
          clone.alarms = group.alarms;
          clone.$key = group.$key;
          clone.appVersion = environment.version;
          clone.enabled = group.enabled;
          return clone;
        });
        return safeCombineLatest(alarms.map(alarm => {
          if ((<any>alarm).groupId) {
            const group = newGroups.find(g => g.$key === (<any>alarm).groupId);
            if (group && !group.alarms.includes(alarm.$key)) {
              group.alarms.push(alarm.$key);
            }
          }
          // If custom alarm, return it
          if (alarm.name || alarm.type === -10) {
            alarm.appVersion = environment.version;
            return of(alarm);
          }
          return this.regenerateAlarm(alarm);
        })).pipe(
          map(res => res.filter(alarm => !!alarm)),
          tap(newAlarms => {
            const deletedAlarms = alarms.filter(a => !newAlarms.some(na => na.$key === a.$key));
            deletedAlarms.forEach(da => {
              this.store.dispatch(new RemoveAlarm(da.$key));
            });
            this.store.dispatch(new SetAlarms(newAlarms));
            this.store.dispatch(new SetGroups(newGroups));
            this.regenerating = false;
          })
        );
      })
    );
    this.progressService.showProgress(operation$, 1, 'ALARMS.Regenerating_alarms').subscribe();
  }

  private sortAlarmDisplays(alarms: AlarmDisplay[]): AlarmDisplay[] {
    return alarms.sort((a, b) => {
      if (a.spawned && a.alarm.done) {
        return 1;
      }
      if (b.spawned && b.alarm.done) {
        return -1;
      }
      if (a.spawned && b.spawned) {
        return Math.abs(a.remainingTime - b.remainingTime) < 10 ? -1 : 1;
      }
      if (a.spawned) {
        return -1;
      }
      if (b.spawned) {
        return 1;
      }
      if (Math.abs(a.remainingTime - b.remainingTime) < 10) {
        return a.alarm.itemId < b.alarm.itemId ? -1 : 1;
      }
      return a.remainingTime < b.remainingTime ? -1 : 1;
    });
  }

  /**
   * Checks if a given alarm is spawned at a given time.
   * @param alarm
   * @param time
   */
  private isSpawned(alarm: Alarm, time: Date): boolean {
    const nextSpawn = this.getNextSpawn(alarm, time);
    if (nextSpawn.days > 0 || (nextSpawn.date && (Math.floor(time.getTime() / 86400000) !== Math.floor(nextSpawn.date.getTime() / 86400000)))) {
      // Nothing spawns for more than a day.
      return false;
    }
    let spawn = nextSpawn.hours;
    let despawn = nextSpawn.despawn;
    despawn = despawn || 24;
    spawn = spawn || 24;
    // If spawn is greater than despawn, it means that it spawns before midnight and despawns after, which is during the next day.
    const despawnsNextDay = spawn > despawn;
    if (!despawnsNextDay) {
      return time.getUTCHours() >= spawn && time.getUTCHours() < despawn;
    } else {
      return time.getUTCHours() >= spawn || time.getUTCHours() < despawn;
    }
  }

  /**
   * Checks if a given alarm is played at a given time.
   *
   * Being played means that the alarm has been played but the node isn't spawned yet.
   * @param alarm
   * @param time
   */
  private isPlayed(alarm: Alarm, time: Date): boolean {
    return this.getMinutesBefore(time, this.getNextSpawn(alarm, time)) < this.settings.alarmHoursBefore * 60;
  }

  private findWeatherSpawnCombination(alarm: Alarm, sortedSpawns: number[], time: number, iteration = time): NextSpawn {
    const weatherSpawns = alarm.weathers
      .map(weather => {
        if (alarm.weathersFrom !== undefined && alarm.weathersFrom.length > 0) {
          return {
            weather: weather,
            spawn: this.weatherService.getNextWeatherTransition(alarm.mapId, alarm.weathersFrom, weather, iteration,
              alarm.spawns, alarm.duration)
          };
        }
        return { weather: weather, spawn: this.weatherService.getNextWeatherStart(alarm.mapId, weather, iteration, false, alarm.spawns, alarm.duration) };
      })
      .filter(spawn => spawn.spawn !== null)
      .sort((a, b) => a.spawn.getTime() - b.spawn.getTime());
    for (const weatherSpawn of weatherSpawns) {
      for (const spawn of sortedSpawns) {
        const despawn = (spawn + alarm.duration) % 24;
        const weatherStart = weatherSpawn.spawn.getUTCHours();
        const normalWeatherStop = new Date(this.weatherService.getNextDiffWeatherTime(weatherSpawn.spawn.getTime(), weatherSpawn.weather, alarm.mapId)).getUTCHours() || 24;
        const transitionWeatherStop = new Date(this.weatherService.nextWeatherTime(weatherSpawn.spawn.getTime())).getUTCHours() || 24;
        const weatherStop = alarm.weathersFrom?.length > 0 ? transitionWeatherStop : normalWeatherStop;
        const range = TimeUtils.getIntersection([spawn, despawn], [weatherStart, weatherStop % 24]);
        if (range) {
          const intersectSpawn = range[0];
          const intersectDespawn = range[1] || 24;
          // Set the snapshot date to the moment at which the node will spawn for real.
          const date = weatherSpawn.spawn;
          date.setUTCHours(intersectSpawn);
          date.setUTCMinutes(0);
          date.setUTCSeconds(0);
          date.setUTCMilliseconds(0);
          // Adding 3 seconds margin for days computation
          const days = Math.max(Math.floor((weatherSpawn.spawn.getTime() - time + 3000 * EorzeanTimeService.EPOCH_TIME_FACTOR) / 86400000), 0);
          // If it's for today, make sure it's not already despawned
          const now = new Date(time);
          const didntSpawnYet = !TimeUtils.isSameDay(now, weatherSpawn.spawn) || now.getUTCHours() < intersectDespawn;
          const isSpawned = TimeUtils.isSameDay(now, weatherSpawn.spawn) && now.getUTCHours() >= weatherStart;
          if (days > 0 || didntSpawnYet || isSpawned) {
            return {
              hours: intersectSpawn,
              days: days,
              despawn: intersectDespawn,
              weather: weatherSpawn.weather,
              date
            };
          }
        }
      }
    }
    if (sortedSpawns?.length === 0) {
      const weatherSpawn = weatherSpawns[0];
      const days = Math.max(Math.floor((weatherSpawn.spawn.getTime() - time) / 86400000), 0);
      return {
        hours: weatherSpawn.spawn.getUTCHours(),
        days: days,
        date: weatherSpawn.spawn,
        despawn: new Date(this.weatherService.nextWeatherTime(weatherSpawn.spawn.getTime())).getUTCHours() || 24,
        weather: weatherSpawn.weather
      };
    }

    try {
      return this.findWeatherSpawnCombination(alarm, sortedSpawns, time, this.weatherService.nextWeatherTime(weatherSpawns[0].spawn.getTime()));
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private applyFishEyes(alarm: Partial<Alarm>): Partial<Alarm>[] {
    const patch = this.itemPatch && this.itemPatch[alarm.itemId];
    const expansion = this.patches.find(p => p.ID === patch)?.ExVersion;
    const isLegendary = this.legendaryFish && this.legendaryFish[alarm.itemId];
    // The changes only apply to fishes pre-ShB and non-legendary
    if (expansion < 3 && alarm.weathers?.length > 0 && alarm.spawns && !isLegendary) {
      const { spawns, ...alarmWithFishEyesEnabled } = alarm;
      return [alarm, { ...alarmWithFishEyesEnabled, fishEyes: true }];
    }
    return [alarm];
  }

  pureUpdateAlarm(key: string, alarm: UpdateData<Alarm>): void {
    this.store.dispatch(new PureUpdateAlarm(key, alarm));
  }

  setAlarmDone(key: string, done: boolean): void {
    this.store.dispatch(new SetAlarmDone(key, done));
  }
}
