import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AlarmsState } from './alarms.reducer';
import { alarmsQuery } from './alarms.selectors';
import {
  AddAlarms,
  AssignGroupToAlarm,
  CreateAlarmGroup,
  DeleteAlarmGroup,
  LoadAlarms,
  RemoveAlarm,
  UpdateAlarm,
  UpdateAlarmGroup
} from './alarms.actions';
import { Alarm } from '../alarm';
import { filter, first, map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class AlarmsFacade {

  loaded$ = this.store.select(alarmsQuery.getLoaded);
  allAlarms$ = this.store.select(alarmsQuery.getAllAlarms);
  allGroups$ = this.store.select(alarmsQuery.getAllGroups);

  alarmsPageDisplay$ = combineLatest([this.etime.getEorzeanTime(), this.allAlarms$, this.allGroups$]).pipe(
    map(([date, alarms, groups]) => {
      const display = new AlarmsPageDisplay();
      // First of all, populate grouped alarms.
      display.groupedAlarms = groups
        .sort((a, b) => {
          if (a.index === b.index) {
            return a.name < b.name ? -1 : 1;
          }
          return a.index < b.index ? -1 : 1;
        })
        .map(group => {
          const groupAlarms = alarms
            .filter(alarm => alarm.groupId !== undefined && alarm.groupId === group.$key);
          return new AlarmGroupDisplay(group, this.createDisplayArray(groupAlarms, date));
        });

      // Then, populate the alarms without group, I know this isn't the best approach, but it's the easiest to read for a small perf loss.
      display.noGroup = this.createDisplayArray(alarms.filter(alarm => groups.find(group => group.$key !== undefined && group.$key === alarm.groupId) === undefined), date);

      return display;
    })
  );

  alarmsSidebarDisplay$ = this.alarmsPageDisplay$.pipe(
    map(alarmsPageDisplay => {
      return this.sortAlarmDisplays([
        ...alarmsPageDisplay.noGroup.filter(display => display.alarm.enabled),
        ...[].concat.apply([], alarmsPageDisplay.groupedAlarms
          .filter(groupedAlarms => groupedAlarms.group.enabled)
          .map(grouped => {
            return grouped.alarms.map(alarm => {
              alarm.groupName = grouped.group.name;
              return alarm;
            });
          }))
          .filter(display => display.alarm.enabled)
      ]);
    })
  );

  private nextSpawnCache: any = {};

  constructor(private store: Store<{ alarms: AlarmsState }>, private etime: EorzeanTimeService,
              private settings: SettingsService, private weatherService: WeatherService) {
  }

  public addAlarms(...alarms: Alarm[]): void {
    this.store.dispatch(new AddAlarms(alarms));
  }

  public addAlarmsAndGroup(alarms: Alarm[], groupName: string): void {
    this.store.dispatch(new CreateAlarmGroup(groupName, 0));
    this.allGroups$.pipe(
      map(groups => groups.find(g => g.name === groupName && g.index === 0)),
      filter(g => g !== undefined && g.$key !== undefined),
      first()
    ).subscribe(group => {
      alarms.forEach(alarm => alarm.groupId = group.$key);
      this.store.dispatch(new AddAlarms(alarms));
    });
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

  /**
   * Only one alarm can be added for each item.
   * @param alarm
   */
  public hasAlarm(alarm: Partial<Alarm>): Observable<boolean> {
    return this.getRegisteredAlarm(alarm).pipe(map(a => a !== undefined));
  }

  public getRegisteredAlarm(alarm: Partial<Alarm>): Observable<Alarm> {
    return this.allAlarms$.pipe(
      map(alarms => alarms.find(a => a.itemId === alarm.itemId && a.zoneId === alarm.zoneId))
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

}
