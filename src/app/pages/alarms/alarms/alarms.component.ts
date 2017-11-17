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

    constructor(public alarmService: AlarmService, private etime: EorzeanTimeService) {
    }

    public getAlarms(): Observable<Alarm[]> {
        return this.etime.getEorzeanTime().map(time => {
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

}
