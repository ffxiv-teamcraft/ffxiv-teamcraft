import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

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
  RemoveAlarm,
  SetAlarms,
  SetGroups,
  UpdateAlarm,
  UpdateAlarmGroup
} from './alarms.actions';
import { Alarm } from '../alarm';
import { filter, first, map, skipUntil, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { AlarmDisplay } from '../alarm-display';
import { EorzeanTimeService } from '../../eorzea/eorzean-time.service';
import { AlarmsPageDisplay } from '../alarms-page-display';
import { AlarmGroupDisplay } from '../alarm-group-display';
import { AlarmGroup } from '../alarm-group';
import { SettingsService } from '../../../modules/settings/settings.service';
import { WeatherService } from '../../eorzea/weather.service';
import { NextSpawn } from '../next-spawn';
import { weatherIndex } from '../../data/sources/weather-index';
import { mapIds } from '../../data/sources/map-ids';
import { LazyDataService } from '../../data/lazy-data.service';
import { GatheringNode } from '../../data/model/gathering-node';
import { MapService } from '../../../modules/map/map.service';
import { GatheringNodesService } from '../../data/gathering-nodes.service';
import * as semver from 'semver';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { environment } from 'apps/client/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlarmsFacade {

  regenerating = false;

  loaded$ = this.store.select(alarmsQuery.getLoaded);
  allAlarms$ = this.store.select(alarmsQuery.getAllAlarms).pipe(
    skipUntil(this.lazyData.data$),
    map(alarms => {
      if (this.regenerating) {
        return [null];
      }
      if (alarms[0] && semver.ltr(alarms[0].appVersion || '6.0.0', '7.999.999')) {
        this.regenerateAlarms(alarms);
        return [null];
      }
      return alarms;
    }),
    filter(alarms => alarms.length === 0 || !!alarms[0])
  );
  allGroups$ = this.store.select(alarmsQuery.getAllGroups);

  externalGroup$ = this.store.select(alarmsQuery.getExternalGroup);
  externalGroupAlarms$ = this.store.select(alarmsQuery.getExternalGroupAlarms);

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
    })
  );

  alarmsSidebarDisplay$ = combineLatest([this.allAlarms$, this.allGroups$]).pipe(
    map(([alarms, groups]) => {
      return alarms
        .map(alarm => {
          const alarmGroups = groups.filter(g => g.alarms.some(key => key === alarm.$key));
          alarm.groupNames = alarmGroups.map(g => g.name).join(', ');
          if (!alarm.enabled || (alarmGroups.length > 0 && alarmGroups.every(g => !g.enabled))) {
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
    })
  );

  private nextSpawnCache: any = {};

  constructor(private store: Store<{ alarms: AlarmsState }>, private etime: EorzeanTimeService,
              private settings: SettingsService, private weatherService: WeatherService,
              private lazyData: LazyDataService, private mapService: MapService,
              private gatheringNodesService: GatheringNodesService, private progressService: ProgressPopupService) {
  }

  public addAlarms(...alarms: Alarm[]): void {
    this.store.dispatch(new AddAlarms(alarms));
  }

  public addAlarmInGroup(alarm: Alarm, group?: AlarmGroup): void {
    this.addAlarms(alarm);
    if (group) {
      this.allAlarms$.pipe(
        map(as => as.find(a => {
          return a.itemId === alarm.itemId && a.nodeId === alarm.nodeId && a.fishEyes === alarm.fishEyes;
        })),
        filter(a => !!a),
        first()
      ).subscribe(resultAlarm => {
        this.assignAlarmGroup(resultAlarm, group.$key);
      });
    }
  }

  public addAlarmsAndGroup(alarms: Alarm[], groupName: string): void {
    this.store.dispatch(new AddAlarmsAndGroup(alarms, groupName));
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

  public assignAlarmGroup(alarm: Alarm, groupKey: string): void {
    this.store.dispatch(new AssignGroupToAlarm(alarm, groupKey));
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
        return a.itemId === alarm.itemId
          && a.zoneId === alarm.zoneId
          && a.type === alarm.type
          && a.fishEyes === alarm.fishEyes;
      }))
    );
  }

  public loadAlarms(): void {
    this.store.dispatch(new LoadAlarms());
  }

  public createDisplay(alarm: Alarm, date: Date): AlarmDisplay {
    const display = new AlarmDisplay(alarm);
    const nextSpawn = { ...this.getNextSpawn(alarm, date) };
    display.spawned = this.isSpawned(alarm, date);
    display.played = this.isPlayed(alarm, date);
    display.groupNames = alarm.groupNames || '';
    if (display.spawned) {
      if (alarm.duration === null) {
        nextSpawn.hours = nextSpawn.despawn;
      } else {
        nextSpawn.hours = (nextSpawn.hours + alarm.duration) % 24;
      }
      display.remainingTime = this.getMinutesBefore(date, nextSpawn);
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

  private sortAlarmDisplays(alarms: AlarmDisplay[]): AlarmDisplay[] {
    return alarms.sort((a, b) => {
      if (a.spawned && b.spawned) {
        return a.remainingTime < b.remainingTime ? -1 : 1;
      }
      if (a.spawned) {
        return -1;
      }
      if (b.spawned) {
        return 1;
      }
      if (a.remainingTime === b.remainingTime) {
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
    despawn = despawn === 0 ? 24 : despawn;
    spawn = spawn === 0 ? 24 : spawn;
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

  public getNextSpawn(alarm: Alarm, time: Date): NextSpawn {
    const cacheKey = `${alarm.itemId}-${alarm.zoneId}-${(alarm.spawns || []).join(',')}`;
    if (this.nextSpawnCache[cacheKey] === undefined || this.nextSpawnCache[cacheKey].expires.getTime() < Date.now()) {
      const sortedSpawns = (alarm.spawns || []).sort((a, b) => {
        const timeBeforeA = this.getMinutesBefore(time, { hours: a, days: 0 });
        const timeBeforeADespawns = this.getMinutesBefore(time, { hours: (a + alarm.duration) % 24, days: 0 });
        const timeBeforeB = this.getMinutesBefore(time, { hours: b, days: 0 });
        const timeBeforeBDespawns = this.getMinutesBefore(time, { hours: (b + alarm.duration) % 24, days: 0 });
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
      if (alarm.weathers && alarm.weathers.length > 0) {
        this.nextSpawnCache[cacheKey] = {
          spawn: this.findWeatherSpawnCombination(alarm, sortedSpawns, time.getTime()),
          expires: this.etime.toEarthDate(time)
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

  private findWeatherSpawnCombination(alarm: Alarm, sortedSpawns: number[], time: number, iteration = time): NextSpawn {
    const weatherSpawns = alarm.weathers
      .map(weather => {
        if (alarm.weathersFrom !== undefined && alarm.weathersFrom.length > 0) {
          return {
            weather: weather,
            spawn: this.weatherService.getNextWeatherTransition(alarm.mapId, alarm.weathersFrom, weather, iteration, weatherIndex[mapIds.find(m => m.id === alarm.mapId).weatherRate])
          };
        }
        return { weather: weather, spawn: this.weatherService.getNextWeatherStart(alarm.mapId, weather, iteration) };
      })
      .filter(spawn => spawn.spawn !== null)
      .sort((a, b) => a.spawn.getTime() - b.spawn.getTime());
    for (const weatherSpawn of weatherSpawns) {
      for (const spawn of sortedSpawns) {
        const despawn = (spawn + alarm.duration) % 24;
        const weatherStart = weatherSpawn.spawn.getUTCHours();
        const weatherStop = new Date(this.weatherService.nextWeatherTime(weatherSpawn.spawn.getTime())).getUTCHours() || 24;
        if (spawn < despawn) {
          if (weatherStart < despawn && weatherStart >= spawn) {
            // If it spawns during the alarm spawn, return weather spawn time.
            const days = Math.max(Math.floor((weatherSpawn.spawn.getTime() - time) / 86400000), 0);
            return {
              hours: weatherStart,
              days: days,
              despawn: despawn,
              weather: weatherSpawn.weather,
              date: weatherSpawn.spawn
            };
          } else if (weatherStart < spawn && weatherStop > spawn) {
            // If it spawns before the alarm and despawns during the alarm or after,
            // set spawn day hour to spawn hour for days math.
            const realSpawn = new Date(weatherSpawn.spawn);
            realSpawn.setUTCHours(spawn);
            const days = Math.max(Math.floor((realSpawn.getTime() - time) / 86400000), 0);
            return {
              hours: spawn,
              days: days,
              date: weatherSpawn.spawn,
              despawn: Math.min(weatherStop, despawn || 24),
              weather: weatherSpawn.weather
            };
          }
        } else {
          const base48Spawn = spawn || 24;
          const base48Despawn = despawn + 24;
          const base48WeatherStart = weatherStart || 24;
          const base48WeatherStop = base48WeatherStart + 8;
          if (base48WeatherStart < base48Despawn && base48WeatherStart >= base48Spawn) {
            // If it spawns during the alarm spawn, return weather spawn time.
            const days = Math.max(Math.floor((weatherSpawn.spawn.getTime() - time) / 86400000), 0);
            return {
              hours: weatherStart,
              days: days,
              despawn: despawn,
              weather: weatherSpawn.weather,
              date: weatherSpawn.spawn
            };
          } else if (base48WeatherStart < base48Spawn && base48WeatherStop > base48Spawn) {
            // If it spawns before the alarm and despawns during the alarm or after,
            // set spawn day hour to spawn hour for days math.
            const realSpawn = new Date(weatherSpawn.spawn);
            realSpawn.setUTCHours(spawn);
            const days = Math.max(Math.floor((realSpawn.getTime() - time) / 86400000), 0);
            return {
              hours: spawn,
              days: days,
              date: realSpawn,
              despawn: Math.min(weatherStop, despawn || 24),
              weather: weatherSpawn.weather
            };
          }
        }
      }
    }
    if (sortedSpawns.length === 0) {
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
    return this.findWeatherSpawnCombination(alarm, sortedSpawns, time, this.weatherService.nextWeatherTime(weatherSpawns[0].spawn.getTime()));
  }

  /**
   * Get the amount of minutes before a given hour happens.
   * @param currentTime
   * @param spawn
   * @param minutes
   */
  public getMinutesBefore(currentTime: Date, spawn: NextSpawn, minutes = 0): number {
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

  private applyFishEyes(alarm: Partial<Alarm>): Partial<Alarm>[] {
    const patch = this.lazyData.data.itemPatch[alarm.itemId];
    const expansion = this.lazyData.patches.find(p => p.ID === patch)?.ExVersion;
    const isBigFish = this.lazyData.data.bigFishes[alarm.itemId];
    // The changes only apply to fishes pre-SB and non-legendary
    if (expansion < 2 && alarm.weathers?.length > 0 && alarm.spawns && !isBigFish) {
      const { spawns, ...alarmWithFishEyesEnabled } = alarm;
      return [alarm, { ...alarmWithFishEyesEnabled, fishEyes: true }];
    }
    return [alarm];
  }

  public generateAlarms(node: GatheringNode): Alarm[] {
    // If no spawns and no weather, no alarms.
    if (!node.spawns?.length && !node.weathers?.length) {
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
    if (node.gig) {
      alarm.gig = node.gig;
    }
    if (node.baits) {
      alarm.baits = node.baits;
    }
    if (node.hookset) {
      alarm.hookset = node.hookset;
    }
    alarm.aetheryte = this.mapService.getNearestAetheryte(this.lazyData.data.maps[alarm.mapId], alarm.coords);
    return this.applyFishEyes(alarm) as Alarm[];
  }

  public regenerateAlarm(alarm: Partial<Alarm>): Alarm {
    const nodes = this.gatheringNodesService.getItemNodes(alarm.itemId);
    const nodeForThisAlarm = nodes.find(n => {
      if (alarm.nodeId) {
        return n.id === alarm.nodeId;
      }
      return alarm.mapId === n.map;
    }) || nodes[0];
    if (nodeForThisAlarm) {
      const alarms = this.generateAlarms(nodeForThisAlarm);
      const regenerated = alarms.find(a => a.fishEyes === alarm.fishEyes) || alarms[0];
      regenerated.userId = alarm.userId;
      regenerated.$key = alarm.$key;
      regenerated.appVersion = environment.version;
      return regenerated;
    }
  }

  public regenerateAlarms(_alarms?: Alarm[]): void {
    let alarms$ = of(_alarms);
    if (!_alarms) {
      alarms$ = this.allAlarms$;
    }
    const operation$ = combineLatest([alarms$, this.allGroups$]).pipe(
      first(),
      map(([alarms, groups]) => {
        this.regenerating = true;
        const newGroups = groups.map(group => {
          const clone = new AlarmGroup(group.name, group.index);
          clone.userId = group.userId;
          clone.alarms = group.alarms;
          clone.$key = group.$key;
          clone.appVersion = environment.version;
          return clone;
        });
        const newAlarms = alarms.map(alarm => {
          if ((<any>alarm).groupId) {
            const group = newGroups.find(g => g.$key === (<any>alarm).groupId);
            if (group && !group.alarms.includes(alarm.$key)) {
              group.alarms.push(alarm.$key);
            }
          }
          // If custom alarm, return it
          if (alarm.name) {
            alarm.appVersion = environment.version;
            return alarm;
          }
          return this.regenerateAlarm(alarm);
        });

        this.store.dispatch(new SetAlarms(newAlarms));
        this.store.dispatch(new SetGroups(newGroups));
        this.regenerating = false;
      })
    );
    this.progressService.showProgress(operation$, 1, 'ALARMS.Regenerating_alarms').subscribe();
  }
}
