import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class EorzeanTimeService {

    private static EPOCH_TIME_FACTOR = 20.571428571428573;

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
        return Observable.interval(60000 / EorzeanTimeService.EPOCH_TIME_FACTOR).map(() => {
            return this.toEorzeanDate(new Date());
        });
    }
}
