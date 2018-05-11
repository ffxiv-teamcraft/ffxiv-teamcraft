import {Component, OnInit} from '@angular/core';
import {AlarmService} from '../../../core/time/alarm.service';
import {Alarm} from '../../../core/time/alarm';
import {Observable} from 'rxjs';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';

@Component({
    selector: 'app-alarms-sidebar',
    templateUrl: './alarms-sidebar.component.html',
    styleUrls: ['./alarms-sidebar.component.scss']
})
export class AlarmsSidebarComponent implements OnInit {

    public alarms$: Observable<Alarm[]>;

    public time: Date = new Date();

    constructor(private alarmService: AlarmService, private etime: EorzeanTimeService) {
    }

    trackByAlarm(index: number, alarm: Alarm): number {
        return alarm.itemId;
    }

    ngOnInit() {
        this.alarms$ = this.etime.getEorzeanTime()
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
                return alarms.sort((a, b) => {
                    if (this.alarmService.isAlarmSpawned(a, time)) {
                        return -1;
                    }
                    if (this.alarmService.isAlarmSpawned(b, time)) {
                        return 1;
                    }
                    return this.alarmService.getMinutesBefore(time, a.spawn) < this.alarmService.getMinutesBefore(time, b.spawn) ? -1 : 1;
                });
            });
    }

}
