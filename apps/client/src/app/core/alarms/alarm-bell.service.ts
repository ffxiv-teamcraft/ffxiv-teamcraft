import { Injectable } from '@angular/core';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { AlarmsFacade } from './+state/alarms.facade';
import { combineLatest, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Alarm } from './alarm';
import { LocalizedDataService } from '../data/localized-data.service';
import { SettingsService } from '../../modules/settings/settings.service';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { TranslateService } from '@ngx-translate/core';
import { PushNotificationsService } from 'ng-push';
import { NzNotificationService } from 'ng-zorro-antd';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { MapService } from '../../modules/map/map.service';

@Injectable({
  providedIn: 'root'
})
export class AlarmBellService {

  constructor(private eorzeanTime: EorzeanTimeService, private alarmsFacade: AlarmsFacade, private l12n: LocalizedDataService,
              private settings: SettingsService, private platform: PlatformService, private ipc: IpcService,
              private localizedData: LocalizedDataService, private translate: TranslateService, private pushNotificationsService: PushNotificationsService,
              private notificationService: NzNotificationService, private i18n: I18nToolsService, private mapService: MapService) {
    this.initBell();
  }

  private initBell(): void {
    combineLatest([this.eorzeanTime.getEorzeanTime(), this.alarmsFacade.allAlarms$, this.alarmsFacade.allGroups$])
      .pipe(
        map(([date, alarms, groups]) => {
          return alarms.filter(alarm => {
            if (alarm.spawns === undefined) {
              return false;
            }
            const alarmGroup = groups.find(group => {
              return alarm.groupId === group.$key;
            });
            // If this alarm has a group and it's muted, don't even go further
            if ((alarmGroup && !alarmGroup.enabled) || !alarm.enabled) {
              return false;
            }
            const lastPlayed = this.getLastPlayed(alarm);
            // Ceiling on /6 so precision is 1/10
            const timeBeforePlay = Math.round(this.alarmsFacade.getMinutesBefore(date, this.alarmsFacade.getNextSpawn(alarm, date)) / 6) / 10 - this.settings.alarmHoursBefore;
            // Irl alarm duration in ms
            const irlAlarmDuration = this.eorzeanTime.toEarthTime(alarm.duration * 60) * 1000;
            return Date.now() - lastPlayed >= irlAlarmDuration
              && timeBeforePlay <= 0;
          });
        })
      ).subscribe(alarmsToPlay => alarmsToPlay.forEach(alarm => {
      if (!this.settings.alarmsMuted) {
        this.ring(alarm);
        this.notify(alarm);
      }
    }));
  }

  /**
   * Plays the sound part of the alarm.
   * @param alarm
   */
  public ring(alarm: Alarm): void {
    // Let's ring the alarm !
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

  public notify(_alarm: Alarm): void {
    of(_alarm).pipe(
      switchMap(alarm => {
        if (alarm.aetheryte) {
          return of(alarm);
        }
        return this.mapService.getMapById(alarm.mapId)
          .pipe(
            map((mapData) => {
              if (mapData !== undefined) {
                return this.mapService.getNearestAetheryte(mapData, alarm.coords);
              } else {
                return undefined;
              }
            }),
            map(aetheryte => {
              if (aetheryte !== undefined) {
                alarm.aetheryte = aetheryte;
              }
              return alarm;
            })
          );
      }),
      first()
    ).subscribe(alarm => {
      const aetheryteName = this.i18n.getName(this.localizedData.getPlace(alarm.aetheryte.nameid));
      const notificationIcon = alarm.icon ? `https://www.garlandtools.org/db/icons/item/${alarm.icon}.png` : 'https://ffxivteamcraft.com/assets/logo.png';
      const notificationTitle = alarm.itemId ? this.i18n.getName(this.localizedData.getItem(alarm.itemId)) : alarm.name;
      const notificationBody = `${this.i18n.getName(this.localizedData.getPlace(alarm.zoneId || alarm.mapId))} - `
        + `${aetheryteName ? aetheryteName : ''}` +
        (alarm.slot !== undefined && alarm.slot !== null ? ` - Slot ${alarm.slot}` : '');
      if (this.platform.isDesktop()) {
        this.ipc.send('notification', {
          title: notificationTitle,
          content: notificationBody,
          icon: notificationIcon
        });
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
    });
  }

  private getLastPlayed(alarm: Alarm): number {
    return +(localStorage.getItem(`played:${alarm.$key}`) || 0);
  }
}
