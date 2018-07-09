import {Component, OnInit} from '@angular/core';
import {AlarmService} from '../../../core/time/alarm.service';
import {Alarm} from '../../../core/time/alarm';
import {combineLatest, Observable} from 'rxjs';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';
import {map, tap} from 'rxjs/operators';
import {UserService} from '../../../core/database/user.service';

@Component({
    selector: 'app-alarms-sidebar',
    templateUrl: './alarms-sidebar.component.html',
    styleUrls: ['./alarms-sidebar.component.scss']
})
export class AlarmsSidebarComponent implements OnInit {

    public alarms$: Observable<Alarm[]>;

    public time: Date = new Date();

    constructor(private alarmService: AlarmService, private etime: EorzeanTimeService, private userService: UserService) {
    }

    trackByAlarm(index: number, alarm: Alarm): number {
        return alarm.itemId;
    }

    ngOnInit() {

        const alarmGroups$ = combineLatest(this.etime.getEorzeanTime(), this.userService.getUserData())
            .pipe(
                tap(([time, user]) => this.time = time),
                map(([time, user]) => {
                    const result = user.alarmGroups.map(group => {
                        return {groupName: group.name, enabled: group.enabled, alarms: []};
                    });
                    const alarms: Alarm[] = [];
                    this.alarmService.alarms.forEach(alarm => {
                        if (alarms.find(a => a.itemId === alarm.itemId) !== undefined) {
                            return;
                        }
                        const itemAlarms = this.alarmService.alarms.filter(a => a.itemId === alarm.itemId);
                        alarms.push(this.alarmService.closestAlarm(itemAlarms, time));
                    });
                    alarms.forEach(alarm => {
                        const group = result.find(row => row.groupName === alarm.groupName);
                        if (alarm.groupName === undefined || group === undefined) {
                            const defaultGroup = result.find(row => row.groupName === 'Default group');
                            defaultGroup.alarms.push(alarm);
                        } else {
                            group.alarms.push(alarm);
                        }
                    });
                    result.forEach(group => {
                        group.alarms = group.alarms.sort();
                    });
                    return result;
                })
            );

        this.alarms$ = combineLatest(this.etime.getEorzeanTime(), alarmGroups$).pipe(
            map(([time, groups]) => {
                return groups
                    .reduce((overlayAlarms, currentGroup) => {
                        if (currentGroup.enabled) {
                            overlayAlarms.push(...currentGroup.alarms);
                        }
                        return overlayAlarms;
                    }, [])
                    .sort((a, b) => {
                        if (this.alarmService.isAlarmSpawned(a, time)) {
                            return -1;
                        }
                        if (this.alarmService.isAlarmSpawned(b, time)) {
                            return 1;
                        }
                        return this.alarmService.getMinutesBefore(time, (a.spawn || 24)) <
                        this.alarmService.getMinutesBefore(time, (b.spawn || 24)) ? -1 : 1;
                    });
            })
        );
    }

}
