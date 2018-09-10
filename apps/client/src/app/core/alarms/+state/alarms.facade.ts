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
  UpdateAlarmGroup
} from './alarms.actions';
import { Alarm } from '../alarm';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { AlarmDisplay } from '../alarm-display';
import { EorzeanTimeService } from '../../time/eorzean-time.service';
import { AlarmsPageDisplay } from '../alarms-page-display';
import { AlarmGroupDisplay } from '../alarm-group-display';
import { AlarmGroup } from '../alarm-group';

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
          .filter(groupedAlarms => !groupedAlarms.group.muted)
          .map(grouped => grouped.alarms))
      ]);
    })
  );

  constructor(private store: Store<{ alarms: AlarmsState }>, private etime: EorzeanTimeService) {
  }

  public addAlarms(alarms: Alarm[]): void {
    this.store.dispatch(new AddAlarms(alarms));
  }

  public deleteAlarm(alarm: Alarm): void {
    this.store.dispatch(new RemoveAlarm(alarm.$key));
  }

  public createGroup(name: string): void {
    this.store.dispatch(new CreateAlarmGroup(name));
  }

  public updateGroup(group: AlarmGroup): void {
    this.store.dispatch(new UpdateAlarmGroup(group));
  }

  public deleteGroup(key: string): void {
    this.store.dispatch(new DeleteAlarmGroup(key));
  }

  public assignAlarmGroup(alarm: Alarm, groupKey: string):void{
    this.store.dispatch(new AssignGroupToAlarm(alarm, groupKey));
  }

  /**
   * Only one alarm can be added for each item.
   * @param alarm
   */
  public hasAlarm(alarm: Partial<Alarm>): Observable<boolean> {
    return this.allAlarms$.pipe(
      map(alarms => alarms.find(a => a.itemId === alarm.itemId && a.zoneId === alarm.zoneId) !== undefined)
    );
  }

  public loadAlarms(): void {
    this.store.dispatch(new LoadAlarms());
  }

  private createDisplayArray(alarms: Alarm[], date: Date): AlarmDisplay[] {
    return this.sortAlarmDisplays(alarms.map(alarm => {
      const display = new AlarmDisplay(alarm);
      display.spawned = this.isSpawned(alarm, date);
      if (display.spawned) {
        display.remainingTime = this.getMinutesBefore(date, (alarm.spawn + alarm.duration) % 24);
      } else {
        display.remainingTime = this.getMinutesBefore(date, alarm.spawn);
      }
      display.remainingTime = this.etime.toEarthTime(display.remainingTime);
      return display;
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
    let spawn = alarm.spawn;
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
   * Get the amount of minutes before a given hour happens.
   * @param currentTime
   * @param hours
   * @param minutes
   */
  private getMinutesBefore(currentTime: Date, hours: number, minutes = 0): number {
    // Convert 0 to 24 for spawn timers
    if (hours === 0) {
      hours = 24;
    }
    const resHours = hours - currentTime.getUTCHours();
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
