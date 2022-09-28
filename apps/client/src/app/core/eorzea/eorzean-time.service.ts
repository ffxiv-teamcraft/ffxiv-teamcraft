import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, shareReplay, tap } from 'rxjs/operators';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { IS_HEADLESS } from 'apps/client/src/environments/is-headless';

@Injectable({
  providedIn: 'root'
})
export class EorzeanTimeService {

  public static readonly EPOCH_TIME_FACTOR = 20.571428571428573;

  private _timerObservable: BehaviorSubject<Date> = new BehaviorSubject<Date>(this.toEorzeanDate(new Date()));

  // Only used for mocks in dev mode
  private mockTicks = 0;

  constructor(@Inject(PLATFORM_ID) private platform: Object, private ngZone: NgZone) {
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
