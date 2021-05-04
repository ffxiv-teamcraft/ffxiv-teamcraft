import { RealtimeAlarm } from './realtime-alarm';
import { UtcDay } from './utc-day';
import { Injectable } from '@angular/core';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../modules/settings/settings.service';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { PushNotificationsService } from 'ng-push-ivy';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { SoundNotificationService } from '../sound-notification/sound-notification.service';
import { SoundNotificationType } from '../sound-notification/sound-notification-type';

@Injectable({ providedIn: 'root' })
export class RealtimeAlarmsService {

  public static readonly REAL_TIME_ALARMS: { [idnex: string]: RealtimeAlarm } = {
    'WEEKLY_RESETS': new RealtimeAlarm([8], 'WEEKLY_RESETS', UtcDay.TUESDAY),
    'ROULETTES_RESET': new RealtimeAlarm([15], 'ROULETTES_RESET'),
    'DELIVERIES_RESET': new RealtimeAlarm([20], 'DELIVERIES_RESET'),
    'LEVE_ALLOWANCES': new RealtimeAlarm([0, 12], 'LEVE_ALLOWANCES')
  };

  private reloader$ = new BehaviorSubject(null);

  constructor(private etime: EorzeanTimeService, private settings: SettingsService,
              private platform: PlatformService, private ipc: IpcService,
              private pushNotificationsService: PushNotificationsService, private notificationService: NzNotificationService,
              private translate: TranslateService, private soundNotificationService: SoundNotificationService) {
    this.etime.getEorzeanTime().pipe(
      map(() => {
        const enabledAlarms: RealtimeAlarm[] = JSON.parse(localStorage.getItem('alarms:irl') || '[]')
          .map(key => RealtimeAlarmsService.REAL_TIME_ALARMS[key]);
        const irlTime = new Date();
        return enabledAlarms
          .filter(alarm => {
            const lastPlayed = localStorage.getItem(`played:${alarm.label}`);
            return irlTime.getUTCSeconds() === 0
              && irlTime.getUTCMinutes() === 0
              && (!lastPlayed || (irlTime.getTime() - new Date(lastPlayed).getTime() > 60000))
              && alarm.hours.indexOf(irlTime.getUTCHours()) > -1
              && (alarm.day === undefined || alarm.day === irlTime.getUTCDay());
          });
      })
    ).subscribe(alarms => {
      alarms.forEach(alarm => {
        this.ring(alarm);
      });
    });
  }

  /**
   * Plays the sound part of the alarm.
   * @param alarm
   */
  public ring(alarm: RealtimeAlarm): void {
    this.soundNotificationService.play(SoundNotificationType.RESET_TIMER);
    localStorage.setItem(`played:${alarm.label}`, new Date().toUTCString());

    if (this.platform.isDesktop()) {
      this.ipc.send('notification', {
        title: this.translate.instant(`ALARMS.REALTIME.${alarm.label}`),
        content: '',
        icon: '/assets/icons/notice.png'
      });
    } else {
      this.pushNotificationsService.create(this.translate.instant(`ALARMS.REALTIME.${alarm.label}`),
        {
          icon: '/assets/icons/notice.png',
          sticky: false,
          renotify: false
        }
      ).subscribe();
      this.notificationService.info(this.translate.instant(`ALARMS.REALTIME.${alarm.label}`), '');
    }
  }

  public getTimers(): Observable<{ enabled: boolean, label: string, time: number }[]> {
    return combineLatest([this.etime.getEorzeanTime(), this.reloader$]).pipe(
      map(() => {
        const enabledAlarms = JSON.parse(localStorage.getItem('alarms:irl') || '[]');
        return Object.keys(RealtimeAlarmsService.REAL_TIME_ALARMS)
          .map(key => RealtimeAlarmsService.REAL_TIME_ALARMS[key])
          .map(alarm => {
            const closestHour = alarm.hours.sort((a, b) => {
              const timeBeforeA = this.getTimeBefore(a, alarm.day).getTime();
              const timeBeforeB = this.getTimeBefore(b, alarm.day).getTime();
              if (timeBeforeA < 0) {
                return 1;
              }
              if (timeBeforeB < 0) {
                return -1;
              }
              return timeBeforeA - timeBeforeB;
            })[0];
            return {
              label: alarm.label,
              enabled: enabledAlarms.indexOf(alarm.label) > -1,
              time: Math.floor(this.getTimeBefore(closestHour, alarm.day).getTime() / 1000)
            };
          });
      })
    );
  }

  private getTimeBefore(hour: number, day?: number): Date {
    if (hour < new Date().getUTCHours() && day === undefined) {
      day = new Date().getUTCDay() + 1;
    }
    const nextIteration = new Date();
    nextIteration.setUTCMinutes(0);
    nextIteration.setUTCSeconds(0);
    nextIteration.setUTCMilliseconds(0);
    nextIteration.setUTCHours(hour);
    if (day !== undefined) {
      const currentDay = nextIteration.getDay();
      const distance = day - currentDay;
      nextIteration.setDate(nextIteration.getDate() + distance);
      if (nextIteration.getTime() < Date.now()) {
        nextIteration.setTime(nextIteration.getTime() + 86400000 * 7);
      }
    }
    return new Date(nextIteration.getTime() - Date.now());
  }

  public reload(): void {
    this.reloader$.next(null);
  }
}
