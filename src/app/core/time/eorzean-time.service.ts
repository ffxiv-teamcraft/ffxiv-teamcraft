import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class EorzeanTimeService {

    private static EPOCH_TIME_FACTOR = 20.571428571428573;

    public toEorzeanTime(date: Date): Date {
        // 60 * 24 Eorzean minutes (one day) per 70 real-world minutes.
        return new Date(date.getTime() * EorzeanTimeService.EPOCH_TIME_FACTOR);
    }

    public getEorzeanTime(): Observable<Date> {
        return Observable.interval(1000).map(() => {
            return this.toEorzeanTime(new Date());
        });
    }
}
