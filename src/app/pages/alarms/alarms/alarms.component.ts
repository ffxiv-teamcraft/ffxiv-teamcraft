import {Component} from '@angular/core';
import {AlarmService} from '../../../core/time/alarm.service';
import {Alarm} from '../../../core/time/alarm';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';
import {MatDialog} from '@angular/material';
import {AddAlarmPopupComponent} from '../add-alarm-popup/add-alarm-popup.component';
import {TimerOptionsPopupComponent} from '../../list/timer-options-popup/timer-options-popup.component';
import {SettingsService} from '../../settings/settings.service';
import {ObservableMedia} from '@angular/flex-layout';
import {filter, first, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {IpcService} from '../../../core/electron/ipc.service';
import {PlatformService} from '../../../core/tools/platform.service';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../../core/database/user.service';
import {AlarmGroupNamePopupComponent} from '../../../modules/common-components/alarm-group-name-popup/alarm-group-name-popup.component';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';

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

    alarmGroups$: Observable<{ groupName: string, enabled: boolean, alarms: Alarm[] }[]>;

    overlayAlarms$: Observable<Alarm[]>;

    constructor(public alarmService: AlarmService, public etime: EorzeanTimeService, private dialog: MatDialog,
                private settings: SettingsService, private media: ObservableMedia, private platformService: PlatformService,
                private ipc: IpcService, private route: ActivatedRoute, private userService: UserService) {
        this.desktop = platformService.isDesktop();
        route.queryParams.subscribe(params => {
            this.overlay = params.overlay === 'true';
            if (this.overlay) {
                this.ipc.overlayUri = '/alarms';
            }
        });

        const timer$ = this.reloader.pipe(
            switchMap(() => this.etime.getEorzeanTime()),
            tap(time => this.time = time)
        );

        const user$ = this.userService.getUserData();

        this.alarmGroups$ = combineLatest(timer$, user$)
            .pipe(
                map(data => {
                    const time = data[0];
                    const user = data[1];
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
                        group.alarms = group.alarms.sort((a, b) => {
                            if (this.alarmService.isAlarmSpawned(a, time)) {
                                return -1;
                            }
                            if (this.alarmService.isAlarmSpawned(b, time)) {
                                return 1;
                            }
                            return this.alarmService.getMinutesBefore(time, (a.spawn || 24)) <
                            this.alarmService.getMinutesBefore(time, (b.spawn || 24)) ? -1 : 1;
                        });
                    });
                    return result;
                })
            );

        this.overlayAlarms$ = this.alarmGroups$.pipe(
            map(groups => {
                return groups.reduce((overlayAlarms, currentGroup) => {
                    if (currentGroup.enabled) {
                        overlayAlarms.push(...currentGroup.alarms);
                    }
                    return overlayAlarms;
                }, []);
            })
        );
    }

    setGroupIndex(groupData: any, index: number): void {
        this.userService.getUserData()
            .pipe(
                first(),
                map(user => {
                    user.alarmGroups = user.alarmGroups.filter(group => group.name !== groupData.groupName);
                    user.alarmGroups.splice(index, 0, {name: groupData.groupName, enabled: groupData.enabled});
                    return user;
                }),
                mergeMap(user => {
                    return this.userService.set(user.$key, user);
                })
            ).subscribe()
    }

    onGroupDrop(group: any, alarm: Alarm): void {
        this.alarmService.setAlarmGroupName(alarm, group.groupName);
    }

    renameGroup(group: any): void {
        this.dialog.open(AlarmGroupNamePopupComponent, {data: group.groupName})
            .afterClosed()
            .pipe(
                filter(name => name !== '' && name !== undefined && name !== null && name !== 'Default group'),
                mergeMap(groupName => {
                    return this.userService.getUserData()
                        .pipe(
                            first(),
                            map(user => {
                                const userGroup = user.alarmGroups.find(g => g.name === group.groupName);
                                userGroup.name = groupName;
                                group.alarms.forEach(alarm => {
                                    this.alarmService.setAlarmGroupName(alarm, groupName);
                                });
                                return user;
                            }),
                            mergeMap(user => {
                                return this.userService.set(user.$key, user);
                            })
                        )
                })
            )
            .subscribe();
    }

    trackByGroupFn(index: number, group: any): string {
        return group.groupName;
    }

    trackByAlarmFn(index: number, alarm: Alarm): number {
        return alarm.itemId;
    }

    addGroup(): void {
        this.dialog.open(AlarmGroupNamePopupComponent)
            .afterClosed()
            .pipe(
                filter(name => name !== '' && name !== undefined && name !== null && name !== 'Default group'),
                mergeMap(groupName => {
                    return this.userService.getUserData()
                        .pipe(
                            first(),
                            map(user => {
                                if (user.alarmGroups.find(group => group.name === groupName) === undefined) {
                                    user.alarmGroups.push({name: groupName, enabled: true});
                                }
                                return user;
                            }),
                            mergeMap(user => {
                                return this.userService.set(user.$key, user);
                            })
                        )
                })
            ).subscribe();
    }

    toggleGroupEnabled(groupName: string): void {
        this.userService.getUserData()
            .pipe(
                first(),
                map(user => {
                    const group = user.alarmGroups.find(g => g.name === groupName);
                    group.enabled = !group.enabled;
                    return user;
                }),
                mergeMap(user => {
                    return this.userService.set(user.$key, user);
                })
            ).subscribe()
    }

    deleteGroup(groupName: string): void {
        this.dialog.open(ConfirmationPopupComponent)
            .afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => {
                    return this.userService.getUserData()
                        .pipe(
                            first(),
                            map(user => {
                                user.alarmGroups = user.alarmGroups.filter(group => group.name !== groupName);
                                return user;
                            }),
                            mergeMap(user => {
                                return this.userService.set(user.$key, user);
                            })
                        )
                })
            ).subscribe();
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
            .subscribe((nodes: any[]) => {
                const alarms: Alarm[] = [];
                nodes.forEach(node => {
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
                });
                this.alarmService.registerAlarms(...alarms);
                this.reloader.next(null);
            });
    }

    showOverlay(): void {
        this.ipc.send('overlay', '/alarms');
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
