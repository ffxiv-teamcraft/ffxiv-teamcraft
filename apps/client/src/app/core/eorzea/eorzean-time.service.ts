import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, shareReplay, tap } from 'rxjs/operators';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class EorzeanTimeService {

  public static readonly EPOCH_TIME_FACTOR = 20.571428571428573;

  private _timerObservable: BehaviorSubject<Date> = new BehaviorSubject<Date>(this.toEorzeanDate(new Date()));

  constructor(@Inject(PLATFORM_ID) private platform: Object, private ngZone: NgZone) {
    if (isPlatformBrowser(this.platform)) {
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
    return Math.round(minutes / EorzeanTimeService.EPOCH_TIME_FACTOR * 60);
  }

  public getEorzeanTime(): Observable<Date> {
    return this._timerObservable.pipe(
      shareReplay(1),
      isPlatformServer(this.platform) ? first() : tap()
    );
  }

  private tick(): void {
    // How to mock time:
    // const mockDate = new Date('Sun, May 5, 2019 17:37:49 UTC');
    // mockDate.setUTCHours(0);
    // mockDate.setUTCMinutes(0);
    // this._timerObservable.next(this.toEorzeanDate(mockDate));
    // console.log(this.toEorzeanDate(new Date()));
    this._timerObservable.next(this.toEorzeanDate(new Date()));
  }
}
