import { Injectable } from '@angular/core';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { AlarmsFacade } from './+state/alarms.facade';
import { combineLatest, of } from 'rxjs';
import { filter, first, map, startWith, switchMap } from 'rxjs/operators';
import { Alarm } from './alarm';
import { SettingsService } from '../../modules/settings/settings.service';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { TranslateService } from '@ngx-translate/core';
import { PushNotificationsService } from 'ng-push-ivy';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { MapService } from '../../modules/map/map.service';
import { SoundNotificationService } from '../sound-notification/sound-notification.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { SoundNotificationType } from '../sound-notification/sound-notification-type';

@Injectable({
  providedIn: 'root'
})
export class AlarmBellService {

  constructor(private eorzeanTime: EorzeanTimeService, private alarmsFacade: AlarmsFacade, private eorzeaFacade: EorzeaFacade,
              private settings: SettingsService, private platform: PlatformService, private ipc: IpcService,
              private translate: TranslateService, private pushNotificationsService: PushNotificationsService,
              private notificationService: NzNotificationService, private i18n: I18nToolsService, private mapService: MapService,
              private lazyData: LazyDataFacade, private soundNotificationService: SoundNotificationService) {
    this.initBell();
  }

  /**
   * Plays the sound part of the alarm.
   * @param alarm
   * @param itemName
   */
  public ring(alarm: Alarm, itemName: string): void {
    localStorage.setItem(`played:${alarm.$key}`, Date.now().toString());
    if (this.settings.TTSAlarms) {
      try {
        const notificationSettings = this.settings.getNotificationSettings(SoundNotificationType.ALARM);
        const speech = new SpeechSynthesisUtterance(itemName);
        speech.pitch = 1.1;
        speech.lang = this.translate.currentLang;
        speech.rate = 1;
        speech.volume = notificationSettings.volume;
        window.speechSynthesis.speak(speech);
      } catch (e) {
        console.error(e);
        this.soundNotificationService.play(SoundNotificationType.ALARM);
      }
    } else {
      this.soundNotificationService.play(SoundNotificationType.ALARM);
    }
  }

  public notify(_alarm: Alarm): void {
    of(_alarm).pipe(
      switchMap(alarm => {
        return this.mapService.getMapById(alarm.mapId)
          .pipe(
            switchMap((mapData) => {
              if (mapData !== undefined) {
                return this.mapService.getNearestAetheryte(mapData, alarm.coords);
              } else {
                return of(undefined);
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
      first(),
      switchMap(alarm => {
        return combineLatest([
          of(alarm),
          this.lazyData.getRow('itemIcons', alarm.itemId),
          this.i18n.getNameObservable('items', alarm.itemId).pipe(
            first()
          ),
          this.i18n.getNameObservable('places', alarm.aetheryte.nameid).pipe(
            first()
          ),
          this.i18n.getNameObservable('places', alarm.zoneId || alarm.mapId).pipe(
            first()
          )
        ]);
      })
    ).subscribe(([alarm, icon, itemName, aetheryteName, placeName]) => {
      const notificationIcon = `https://xivapi.com${icon}`;
      const notificationTitle = alarm.itemId ? itemName : alarm.name;
      const notificationBody = `${placeName} - `
        + `${aetheryteName ? aetheryteName : ''}`;
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
        ).subscribe();
        this.notificationService.info(notificationTitle, notificationBody);
      }
      this.ring(alarm, itemName);
    });
  }

  private initBell(): void {
    combineLatest([
      this.eorzeanTime.getEorzeanTime(),
      this.alarmsFacade.allAlarms$,
      this.alarmsFacade.allGroups$,
      this.eorzeaFacade.mapId$.pipe(startWith(-1)),
      this.lazyData.getEntry('maps')
    ])
      .pipe(
        filter(([, , , mapId, maps]) => {
          return !this.platform.isDesktop()
            || mapId === -1
            || !maps[mapId]
            || !maps[mapId]?.dungeon;
        }),
        map(([date, alarms, groups]) => {
          return alarms.filter(alarm => {
            if (alarm.spawns === undefined) {
              return false;
            }

            const groupsForThisAlarm = groups.filter(g => g.alarms.includes(alarm.$key));

            const hasOneGroupEnabled = groupsForThisAlarm.length === 0 || groupsForThisAlarm.some(group => {
              return group.enabled && group.alarms.includes(alarm.$key);
            });
            // If this alarm has a group and it's muted, don't even go further
            if ((!hasOneGroupEnabled) || !alarm.enabled) {
              return false;
            }
            const lastPlayed = this.getLastPlayed(alarm);
            // Ceiling on /6 so precision is 1/10
            const timeBeforePlay = Math.round(this.alarmsFacade.getMinutesBefore(date, this.alarmsFacade.getNextSpawn(alarm, date)) / 6) / 10 - this.settings.alarmHoursBefore;
            // Irl alarm duration in ms
            let irlAlarmDuration = this.eorzeanTime.toEarthTime(alarm.duration * 60) * 1000;
            // If the alarm has no duration, it's because it has no spawn time and only depends on weather
            if (irlAlarmDuration === 0) {
              irlAlarmDuration = this.eorzeanTime.toEarthTime(8 * 60) * 1000;
            }
            return Date.now() - lastPlayed >= irlAlarmDuration
              && timeBeforePlay <= 0;
          });
        })
      ).subscribe(alarmsToPlay => {
      alarmsToPlay.forEach(alarm => {
        if (!this.settings.alarmsMuted) {
          this.notify(alarm);
        }
      });
    });
  }

  private getLastPlayed(alarm: Alarm): number {
    return +(localStorage.getItem(`played:${alarm.$key}`) || 0);
  }
}
