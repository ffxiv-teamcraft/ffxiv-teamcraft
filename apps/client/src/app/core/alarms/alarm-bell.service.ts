import { Injectable } from '@angular/core';
import { EorzeanTimeService } from '../time/eorzean-time.service';
import { AlarmsFacade } from './+state/alarms.facade';
import { AlarmDisplay } from './alarm-display';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Alarm } from './alarm';
import { LocalizedDataService } from '../data/localized-data.service';

@Injectable({
  providedIn: 'root'
})
export class AlarmBellService {

  constructor(private eorzeanTime: EorzeanTimeService, private alarmsFacade: AlarmsFacade, private l12n: LocalizedDataService) {
    this.initBell();
  }

  private initBell(): void {
    combineLatest(this.eorzeanTime.getEorzeanTime(), this.alarmsFacade.allAlarms$)
      .pipe(
        map(([date, alarms]) => {
          return alarms.filter(alarm => {
            const lastPlayed = this.getLastPlayed(alarm);
            // Irl alarm duration in ms
            const irlAlarmDuration = this.eorzeanTime.toEarthTime(alarm.duration * 3600000);
            return Date.now() - lastPlayed > irlAlarmDuration &&
              date.getUTCHours() === alarm.spawn && date.getUTCMinutes() === 0;
          });
        })
      ).subscribe(alarmsToPlay => alarmsToPlay.forEach(alarm => this.ring(alarm)));
  }

  public getAlarmsDisplay(): Observable<AlarmDisplay[]> {
    return combineLatest(this.eorzeanTime.getEorzeanTime(), this.alarmsFacade.allAlarms$)
      .pipe(
        map(([date, alarms]) => {
          return alarms
            .map(alarm => {
              const display = new AlarmDisplay(alarm);
              display.spawned = this.isSpawned(alarm, date);
              if (display.spawned) {
                display.remainingTime = this.getMinutesBefore(date, (alarm.spawn + alarm.duration) % 24);
              } else {
                display.remainingTime = this.getMinutesBefore(date, alarm.spawn);
              }
              display.remainingTime = this.eorzeanTime.toEarthTime(display.remainingTime);
              return display;
            })
            .sort((a, b) => {
              if (a.spawned && b.spawned) {
                return a.remainingTime < b.remainingTime ? -1 : 1;
              }
              if (a.spawned) {
                return -1;
              }
              if (b.spawned) {
                return 1;
              }
              return a.remainingTime > b.remainingTime ? -1 : 1;
            });
        })
      );
  }

  public ring(alarm: Alarm): void {
    console.log('RING', this.l12n.getItem(alarm.itemId).en);
  }

  private getLastPlayed(alarm: Alarm): number {
    return +(localStorage.getItem(`played:${alarm.$key}`) || 0);
  }

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
