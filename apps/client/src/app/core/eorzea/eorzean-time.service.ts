import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, shareReplay, tap } from 'rxjs/operators';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { IS_HEADLESS } from '../../../environments/is-headless';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class EorzeanTimeService {

  public static readonly EPOCH_TIME_FACTOR = 20.571428571428573;

  private _timerObservable: BehaviorSubject<Date> = new BehaviorSubject<Date>(this.toEorzeanDate(new Date()));

  // Only used for mocks in dev mode
  private mockTicks = 0;

  constructor(@Inject(PLATFORM_ID) private platform: any, private ngZone: NgZone, private translate: TranslateService) {
    if (isPlatformBrowser(this.platform) && !IS_HEADLESS) {
      this.ngZone.runOutsideAngular(() => {
        setInterval(() => this.tick(), 20000 / EorzeanTimeService.EPOCH_TIME_FACTOR);
      });
    }
  }

  /**
   * Converts an earth date to an eorzean date.
   * @param {Date} date
   * @returns {Date}
   */
  public toEorzeanDate(date: Date): Date {
    // 60 * 24 Eorzean minutes (one day) per 70 real-world minutes.
    return new Date(date.getTime() * EorzeanTimeService.EPOCH_TIME_FACTOR);
  }

  /**
   * Converts an eorzean date to an earth date.
   * @param {Date} date
   * @returns {Date}
   */
  public toEarthDate(date: Date): Date {
    // 60 * 24 Eorzean minutes (one day) per 70 real-world minutes.
    return new Date(date.getTime() / EorzeanTimeService.EPOCH_TIME_FACTOR);
  }

  /**
   * Converts an eorzean minutes amount to an earth seconds amount.
   * @returns {Date}
   * @param minutes
   */
  public toEarthTime(minutes: number): number {
    return Math.floor(60 * minutes / EorzeanTimeService.EPOCH_TIME_FACTOR);
  }

  public getEorzeanTime(): Observable<Date> {
    return this._timerObservable.pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      isPlatformServer(this.platform) || IS_HEADLESS ? first() : tap()
    );
  }

  public toStringTimer(duration: number, verbose = false):string{
    const seconds = duration % 60;
    const minutes = Math.floor(duration / 60) % 60;
    const hours = Math.floor(duration / 3600) % 24;
    const days = Math.floor(duration / 86400);
    const secondsString = `${seconds < 10 ? 0 : ''}${seconds}`;
    const minutesString = `${minutes < 10 ? 0 : ''}${minutes}`;
    const hoursString = `${hours < 10 ? 0 : ''}${hours}`;
    const daysString = `${days}`;
    if (verbose) {
      return `${days > 0 ? daysString + this.translate.instant(days > 1 ? 'TIMERS.Days' : 'TIMERS.Day') : ''} ${hoursString}${this.translate.instant('TIMERS.Hours')} ${minutesString}${this.translate.instant('TIMERS.Minutes')} ${secondsString}${this.translate.instant('TIMERS.Seconds')}`;
    } else {
      return `${days > 0 ? daysString + ':' : ''}${(hours > 0 || days > 0) ? hoursString + ':' : ''}${minutesString}:${secondsString}`;
    }
  }

  private tick(): void {
    // How to mock time:
    // Set date here and uncomment the next 3 lines
    // const mockDate = new Date(new Date('Aug 14, 2022 19:45:00 GMT+2').getTime() + this.mockTicks);
    // this.mockTicks += 20000 / EorzeanTimeService.EPOCH_TIME_FACTOR;
    // this._timerObservable.next(this.toEorzeanDate(mockDate));

    // Then comment this one:
    this._timerObservable.next(this.toEorzeanDate(new Date()));
  }
}
