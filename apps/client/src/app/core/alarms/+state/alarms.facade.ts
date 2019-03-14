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

@Injectable({
  providedIn: 'root'
})
export class AlarmsFacade {

  loaded$ = this.store.select(alarmsQuery.getLoaded);
  allAlarms$ = this.store.select(alarmsQuery.getAllAlarms);
  allGroups$ = this.store.select(alarmsQuery.getAllGroups);

  alarmsPageDisplay$ = combineLatest(this.etime.getEorzeanTime(), this.allAlarms$, this.allGroups$).pipe(
    map(([date, alarms, groups]) => {
      const display = new AlarmsPageDisplay();
      // First of all, populate grouped alarms.
      display.groupedAlarms = groups
        .sort((a, b) => a.index < b.index ? -1 : 1)
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
        ...alarmsPageDisplay.noGroup,
        ...[].concat.apply([], alarmsPageDisplay.groupedAlarms
          .filter(groupedAlarms => groupedAlarms.group.enabled)
          .map(grouped => grouped.alarms))
      ]);
    })
  );

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
    display.spawned = this.isSpawned(alarm, date);
    display.played = this.isPlayed(alarm, date);
    if (display.spawned) {
      display.remainingTime = this.getMinutesBefore(date, (this.getNextSpawn(alarm, date) + alarm.duration) % 24);
    } else {
      display.remainingTime = this.getMinutesBefore(date, this.getNextSpawn(alarm, date));
    }
    display.remainingTime = this.etime.toEarthTime(display.remainingTime);
    display.nextSpawn = this.getNextSpawn(alarm, date);
    return display;
  }

  public createDisplayArray(alarms: Alarm[], date: Date): AlarmDisplay[] {
    return this.sortAlarmDisplays(alarms.filter(alarm => alarm.spawns !== undefined)
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
      return a.remainingTime < b.remainingTime ? -1 : 1;
    });
  }

  /**
   * Checks if a given alarm is spawned at a given time.
   * @param alarm
   * @param time
   */
  private isSpawned(alarm: Alarm, time: Date): boolean {
    let spawn = this.getNextSpawn(alarm, time);
    let despawn = (spawn + alarm.duration) % 24;
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

  public getNextSpawn(alarm: Alarm, time: Date): number {
    if (alarm.weathers) {
      alarm.weathers.forEach(weather => {
        console.log(this.weatherService.getNextWeatherStart(alarm.mapId, weather, time));
      });
    }
    return alarm.spawns.sort((a, b) => {
      const timeBeforeA = this.getMinutesBefore(time, a);
      const timeBeforeADespawns = this.getMinutesBefore(time, (a + alarm.duration) % 24);
      const timeBeforeB = this.getMinutesBefore(time, b);
      const timeBeforeBDespawns = this.getMinutesBefore(time, (b + alarm.duration) % 24);
      // If time before next spawn is greater than time before next despawn, this node is spawned !
      if (timeBeforeADespawns < timeBeforeA) {
        return -1;
      }
      if (timeBeforeBDespawns < timeBeforeB) {
        return 1;
      }
      // Else just compare remaining time.
      return timeBeforeA < timeBeforeB ? -1 : 1;
    })[0];
  }

  /**
   * Get the amount of minutes before a given hour happens.
   * @param currentTime
   * @param hours
   * @param minutes
   */
  public getMinutesBefore(currentTime: Date, hours: number, minutes = 0): number {
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
    return resMinutes;
  }

}
