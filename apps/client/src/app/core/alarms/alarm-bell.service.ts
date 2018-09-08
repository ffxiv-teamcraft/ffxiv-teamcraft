import { Injectable } from '@angular/core';
import { EorzeanTimeService } from '../time/eorzean-time.service';
import { AlarmsFacade } from './+state/alarms.facade';
import { AlarmDisplay } from './alarm-display';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Alarm } from './alarm';
import { LocalizedDataService } from '../data/localized-data.service';
import { SettingsService } from '../../pages/settings/settings.service';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { TranslateService } from '@ngx-translate/core';
import { PushNotificationsService } from 'ng-push';
import { NzNotificationService } from 'ng-zorro-antd';
import { I18nToolsService } from '../tools/i18n-tools.service';

@Injectable({
  providedIn: 'root'
})
export class AlarmBellService {

  constructor(private eorzeanTime: EorzeanTimeService, private alarmsFacade: AlarmsFacade, private l12n: LocalizedDataService,
              private settings: SettingsService, private platform: PlatformService, private ipc: IpcService,
              private localizedData: LocalizedDataService, private translate: TranslateService, private pushNotificationsService: PushNotificationsService,
              private notificationService: NzNotificationService, private i18n: I18nToolsService) {
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
      ).subscribe(alarmsToPlay => alarmsToPlay.forEach(alarm => {
      if (!this.settings.alarmsMuted) {
        this.ring(alarm);
        this.notify(alarm);
      }
    }));
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
              return a.remainingTime < b.remainingTime ? -1 : 1;
            });
        })
      );
  }

  /**
   * Plays the sound part of the alarm.
   * @param alarm
   */
  public ring(alarm: Alarm): void {
    //Let's ring the alarm !
    let audio: HTMLAudioElement;
    // If this isn't a file path (desktop app), then take it inside the assets folder.
    if (this.settings.alarmSound.indexOf(':') === -1) {
      audio = new Audio(`./assets/audio/${this.settings.alarmSound}.mp3`);
    } else {
      audio = new Audio(this.settings.alarmSound);
    }
    audio.loop = false;
    audio.volume = this.settings.alarmVolume;
    audio.play();
    localStorage.setItem(`played:${alarm.$key}`, Date.now().toString());
  }

  public notify(alarm: Alarm): void {
    const aetheryteName = this.i18n.getName(this.localizedData.getPlace(alarm.aetheryte.nameid));
    const notificationIcon = `https://www.garlandtools.org/db/icons/item/${alarm.icon}.png`;
    const notificationTitle = this.i18n.getName(this.localizedData.getItem(alarm.itemId));
    const notificationBody = `${this.i18n.getName(this.localizedData.getPlace(alarm.zoneId))} - `
      + `${aetheryteName}` +
      (alarm.slot !== undefined ? ` - Slot ${alarm.slot}` : '');
    if (this.platform.isDesktop()) {

    } else {
      this.pushNotificationsService.create(notificationTitle,
        {
          icon: notificationIcon,
          sticky: false,
          renotify: false,
          body: notificationBody
        }
      );
      this.notificationService.info(notificationTitle, notificationBody);
    }
  }

  private getLastPlayed(alarm: Alarm): number {
    return +(localStorage.getItem(`played:${alarm.$key}`) || 0);
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
