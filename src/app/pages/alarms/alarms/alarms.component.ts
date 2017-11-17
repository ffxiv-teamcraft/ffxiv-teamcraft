import {Component} from '@angular/core';
import {AlarmService} from '../../../core/time/alarm.service';
import {Alarm} from '../../../core/time/alarm';
import {Observable} from 'rxjs/Observable';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';

@Component({
    selector: 'app-alarms',
    templateUrl: './alarms.component.html',
    styleUrls: ['./alarms.component.scss']
})
export class AlarmsComponent {

    time: Date = new Date();

    constructor(public alarmService: AlarmService, public etime: EorzeanTimeService) {
    }

    public getAlarms(): Observable<Alarm[]> {
        return this.etime.getEorzeanTime()
            .do(time => this.time = time)
            .map(time => {
                const alarms: Alarm[] = [];
                this.alarmService.alarms.forEach(alarm => {
                    if (alarms.find(a => a.itemId === alarm.itemId) !== undefined) {
                        return;
                    }
                    const itemAlarms = this.alarmService.alarms.filter(a => a.itemId === alarm.itemId);
                    alarms.push(this.alarmService.closestAlarm(itemAlarms, time));
                });
                return alarms;
            });
    }

    deleteAlarm(alarm: Alarm): void {
        this.alarmService.unregister(alarm.itemId);
    }

}
