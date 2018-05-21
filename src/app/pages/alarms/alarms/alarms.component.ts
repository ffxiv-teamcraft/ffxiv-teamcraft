import {Component} from '@angular/core';
import {AlarmService} from '../../../core/time/alarm.service';
import {Alarm} from '../../../core/time/alarm';
import {BehaviorSubject, Observable} from 'rxjs';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';
import {MatDialog} from '@angular/material';
import {AddAlarmPopupComponent} from '../add-alarm-popup/add-alarm-popup.component';
import {TimerOptionsPopupComponent} from '../../list/timer-options-popup/timer-options-popup.component';
import {SettingsService} from '../../settings/settings.service';
import {ObservableMedia} from '@angular/flex-layout';
import {filter, map, switchMap, tap} from 'rxjs/operators';
import {IpcService} from '../../../core/electron/ipc.service';
import {PlatformService} from '../../../core/tools/platform.service';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-alarms',
    templateUrl: './alarms.component.html',
    styleUrls: ['./alarms.component.scss']
})
export class AlarmsComponent {

    compact: boolean = this.settings.compactAlarms;

    muted: boolean = this.settings.alarmsMuted;

    time: Date = new Date();

    private reloader: BehaviorSubject<void> = new BehaviorSubject<void>(null);

    desktop = false;

    overlay = false;

    constructor(public alarmService: AlarmService, public etime: EorzeanTimeService, private dialog: MatDialog,
                private settings: SettingsService, private media: ObservableMedia, private platformService: PlatformService,
                private ipc: IpcService, private route: ActivatedRoute) {
        this.desktop = platformService.isDesktop();
        route.queryParams.subscribe(params => {
            this.overlay = params.overlay === 'true';
        })
    }

    public getAlarms(): Observable<Alarm[]> {
        return this.reloader.pipe(
            switchMap(() => this.etime.getEorzeanTime()),
            tap(time => this.time = time),
            map(time => {
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
            }));
    }

    saveCompact(): void {
        this.settings.compactAlarms = this.compact;
    }

    saveMuted(): void {
        this.settings.alarmsMuted = this.muted;
    }

    deleteAlarm(alarm: Alarm): void {
        this.alarmService.unregister(alarm.itemId);
    }

    openOptionsPopup(): void {
        this.dialog.open(TimerOptionsPopupComponent);
    }

    openAddAlarmPopup(): void {
        this.dialog.open(AddAlarmPopupComponent).afterClosed()
            .pipe(filter(result => result !== undefined))
            .subscribe((node: any) => {
                const alarms: Alarm[] = [];
                if (node.time !== undefined) {
                    node.time.forEach(spawn => {
                        alarms.push({
                            spawn: spawn,
                            duration: node.uptime / 60,
                            itemId: node.itemId,
                            icon: node.icon,
                            slot: node.slot,
                            areaId: node.areaid,
                            coords: node.coords,
                            zoneId: node.zoneid,
                            type: this.alarmService.getType(node),
                        });
                    });
                }
                this.alarmService.registerAlarms(...alarms);
                this.reloader.next(null);
            });
    }

    showOverlay(): void {
        this.ipc.send('overlay', '/alarms');
    }

    closeOverlay(): void {
        window.close();
    }

    getCols(): number {
        if (this.media.isActive('xs') || this.media.isActive('sm')) {
            return 1;
        }
        if (this.media.isActive('md')) {
            return 2;
        }
        return 3;
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

}
