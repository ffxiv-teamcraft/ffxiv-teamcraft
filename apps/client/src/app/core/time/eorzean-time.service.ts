import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EorzeanTimeService {

  private static EPOCH_TIME_FACTOR = 20.571428571428573;

  private _timerObservable: BehaviorSubject<Date> = new BehaviorSubject<Date>(this.toEorzeanDate(new Date()));


  constructor() {
    setInterval(() => this.tick(), 20000 / EorzeanTimeService.EPOCH_TIME_FACTOR);
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
   * Converts an eorzean minutes amount to an earth seconds amount.
   * @returns {Date}
   * @param minutes
   */
  public toEarthTime(minutes: number): number {
    return Math.round(minutes / EorzeanTimeService.EPOCH_TIME_FACTOR * 60);
  }

  public getEorzeanTime(): Observable<Date> {
    return this._timerObservable;
  }

  private tick(): void {
    // How to mock time:
    // const mockDate = new Date();
    // mockDate.setUTCHours(0);
    // mockDate.setUTCMinutes(0);
    this._timerObservable.next(this.toEorzeanDate(new Date()));
  }
}
