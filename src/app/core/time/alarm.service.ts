import {Injectable} from '@angular/core';
import {EorzeanTimeService} from './eorzean-time.service';
import {Alarm} from './alarm';
import {Observable, of, Subscription} from 'rxjs';
import {ListRow} from '../../model/list/list-row';
import {SettingsService} from '../../pages/settings/settings.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {LocalizedDataService} from '../data/localized-data.service';
import {TranslateService} from '@ngx-translate/core';
import {Timer} from 'app/core/time/timer';
import {MapPopupComponent} from '../../modules/map/map-popup/map-popup.component';
import {BellNodesService} from '../data/bell-nodes.service';
import {PushNotificationsService} from 'ng-push';
import {UserService} from '../database/user.service';
import {first, map, mergeMap} from 'rxjs/operators';
import {AppUser} from '../../model/list/app-user';
import {PlatformService} from '../tools/platform.service';
import {IpcService} from '../electron/ipc.service';
import {MapService} from '../../modules/map/map.service';
import {I18nToolsService} from '../tools/i18n-tools.service';

@Injectable()
export class AlarmService {

    private _alarms: Map<Alarm, Subscription> = new Map<Alarm, Subscription>();

    constructor(private etime: EorzeanTimeService, private settings: SettingsService, private snack: MatSnackBar,
                private localizedData: LocalizedDataService, private translator: TranslateService, private dialog: MatDialog,
                private bellNodesService: BellNodesService, private pushNotificationsService: PushNotificationsService,
                private userService: UserService, private platform: PlatformService, private ipc: IpcService,
                private mapService: MapService, private i18nTools: I18nToolsService) {
        this.userService.getUserData().pipe(map((user: AppUser) => user.alarms || []))
            .subscribe(alarms => this.loadAlarms(...alarms));
    }

    /**
     * Registers a given item and creates an alarm for it.
     * @param {ListRow} item
     * @param groupName
     */
    public register(item: ListRow, groupName?: string): void {
        this.generateAlarms(item).forEach(alarm => {
            if (groupName !== undefined) {
                alarm.groupName = groupName;
            }
            this.registerAlarms(alarm);
        });
    }

    /**
     * Determines if a given item has an activated alarm or not.
     * @returns {boolean}
     * @param itemId
     */
    public hasAlarm(itemId: number): boolean {
        let res = false;
        this._alarms.forEach((value, key) => {
            if (key.itemId === itemId) {
                res = true;
            }
        });
        return res;
    }

    /**
     * Unregisters a given item alarm by finding it, then unregisters the subscription, and finally deletes the entry from the alarms.
     * @param id
     */
    public unregister(id: number): void {
        this.getAlarms(id).forEach((alarm) => {
            this._alarms.get(alarm).unsubscribe();
            this._alarms.delete(alarm);
        });
        this.persistAlarms();
    }

    /**
     * Actual implementation of the registration of an alarm object.
     * @param {Alarm} alarms
     * @private
     */
    public registerAlarms(...alarms: Alarm[]): void {
        this.loadAlarms(...alarms);
        this.persistAlarms();
    }

    /**
     * loads the alarms into the current alarms map
     * @param {Alarm} alarms
     */
    public loadAlarms(...alarms: Alarm[]): void {
        alarms.forEach(alarm => {
            if (Array.from(this._alarms.keys()).find(key => key.itemId === alarm.itemId
                && key.spawn === alarm.spawn) === undefined) {
                alarm.aetheryte$ = this.mapService.getMapById(alarm.zoneId).pipe(
                    map(mapData => this.mapService
                        .getNearestAetheryte(mapData, {x: alarm.coords[0], y: alarm.coords[1]})
                    )
                );
                this._alarms.set(alarm, this.etime.getEorzeanTime().subscribe(time => {
                    if (time.getUTCHours() === this.substractHours(alarm.spawn, this.settings.alarmHoursBefore) &&
                        time.getUTCMinutes() === 0) {
                        this.playAlarm(alarm);
                    }
                }));
            }
        });
    }

    /**
     * Gets alarm entries for a given item based on node spawns and uptime.
     * @param {ListRow} item
     * @private
     */
    public generateAlarms(item: ListRow): Alarm[] {
        const alarms: Alarm[] = [];
        if (item.gatheredBy === undefined) {
            if (item.reducedFrom !== undefined) {
                // If there's a way to get the item via reduction, use the item as base
                const nodes = [].concat
                    .apply([], item.reducedFrom
                        .map(reduction => {
                            if (reduction.obj !== undefined) {
                                return reduction.obj.i;
                            }
                            return reduction;
                        })
                        .map(reduction => this.bellNodesService.getNodesByItemId(reduction)));

                nodes.filter(node => node.time !== undefined)
                    .forEach(node => {
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
                                type: this.getType(node)
                            });
                        });
                    });
                return alarms;
            }
            return [];
        }
        item.gatheredBy.nodes.forEach(node => {
            if (node.time !== undefined) {
                node.time.forEach(spawn => {
                    alarms.push({
                        spawn: spawn,
                        duration: node.uptime / 60,
                        itemId: item.id,
                        icon: item.icon,
                        slot: node.slot,
                        areaId: node.areaid,
                        coords: node.coords,
                        zoneId: node.zoneid,
                        type: this.getType(node)
                    });
                });
            }
        });
        return alarms;
    }


    getType(node: any): number {
        return ['Rocky Outcropping', 'Mineral Deposit', 'Mature Tree', 'Lush Vegetation'].indexOf(node.type);
    }

    public setAlarmGroupName(alarm: Alarm, groupName: string): void {
        this.alarms.filter(a => a.itemId === alarm.itemId)
            .forEach(a => a.groupName = groupName);
        this.persistAlarms();
    }

    /**
     * Plays the alarm (audio + snack).
     * @param {Alarm} alarm
     */
    private playAlarm(alarm: Alarm): void {
        if (this.settings.alarmsMuted) {
            return;
        }
        this.userService.getUserData()
            .pipe(
                first(),
                mergeMap(user => {
                    let alarmGroup = user.alarmGroups.find(group => group.name === alarm.groupName);
                    if (alarmGroup === undefined) {
                        alarmGroup = user.alarmGroups.find(group => group.name === 'Default group')
                    }
                    // If the group of this alarm is disabled, don't play the alarm.
                    if (alarmGroup !== undefined && !alarmGroup.enabled) {
                        return of(null);
                    }
                    const lastPlayed = localStorage.getItem('alarms:lastPlayed');
                    // Don't play the alarm if it was played less than half a minute ago
                    if (lastPlayed === null || Date.now() - +lastPlayed > 30000) {
                        this.snack.open(this.translator.instant('ALARM.Spawned',
                            {itemName: this.localizedData.getItem(alarm.itemId)[this.translator.currentLang]}),
                            this.translator.instant('ALARM.See_on_map'),
                            {duration: 5000})
                            .onAction().subscribe(() => {
                            this.dialog.open(MapPopupComponent, {
                                data: {
                                    coords: {
                                        x: alarm.coords[0],
                                        y: alarm.coords[1]
                                    },
                                    id: alarm.zoneId
                                }
                            });
                        });
                        let audio: HTMLAudioElement;
                        if (this.settings.alarmSound.indexOf(':') === -1) {
                            audio = new Audio(`./assets/audio/${this.settings.alarmSound}.mp3`);
                        } else {
                            audio = new Audio(this.settings.alarmSound);
                        }
                        audio.loop = false;
                        audio.volume = this.settings.alarmVolume;
                        audio.play();
                        localStorage.setItem('alarms:lastPlayed', Date.now().toString());
                        return this.mapService.getMapById(alarm.zoneId)
                            .pipe(
                                map(mapData => this.mapService.getNearestAetheryte(mapData, {x: alarm.coords[0], y: alarm.coords[1]})),
                                map(aetheryte => this.i18nTools.getName(this.localizedData.getPlace(aetheryte.nameid))),
                                mergeMap(closestAetheryteName => {
                                    const notificationTitle = this.localizedData.getItem(alarm.itemId)[this.translator.currentLang];
                                    const notificationBody = `${this.localizedData.getPlace(alarm.zoneId)[this.translator.currentLang]} - `
                                        + `${closestAetheryteName}` +
                                        (alarm.slot !== null ? ` - Slot ${alarm.slot}` : '');
                                    const notificationIcon = `https://www.garlandtools.org/db/icons/item/${alarm.icon}.png`;
                                    if (this.platform.isDesktop()) {
                                        this.ipc.send('notification', {
                                            title: notificationTitle,
                                            content: notificationBody,
                                            icon: notificationIcon
                                        });
                                    } else {
                                        return this.pushNotificationsService.create(notificationTitle,
                                            {
                                                icon: notificationIcon,
                                                sticky: false,
                                                renotify: false,
                                                body: notificationBody
                                            }
                                        )
                                    }
                                })
                            )
                    } else {
                        return of(null);
                    }
                })
            ).subscribe(() => {
        }, err => {
            // If there's an error, it means that we don't have permission, that's not a problem but we want to catch it.
        });
    }

    /**
     * Return the amount of minutes before the next alarm of the item.
     * @param {ListRow} item
     * @returns {Observable<number>}
     */
    public getTimers(item: ListRow): Observable<Timer[]> {
        return this.etime.getEorzeanTime().pipe(
            map(time => {
                const alarms = this.generateAlarms(item).reduce(function (rv, x) {
                    (rv[x.type] = rv[x.type] || []).push(x);
                    return rv;
                }, {});
                return Object.keys(alarms).map(key => {
                    const alarm = this.closestAlarm(alarms[key], time);
                    if (this._isSpawned(alarm, time)) {
                        const timer = this.getMinutesBefore(time, (alarm.spawn + alarm.duration) % 24);
                        return {
                            itemId: alarm.itemId,
                            display: this.getTimerString(this.etime.toEarthTime(timer)),
                            time: timer,
                            slot: alarm.slot,
                            zoneId: alarm.zoneId,
                            coords: alarm.coords, areaId: alarm.areaId,
                            type: alarm.type,
                            alarm: alarm,
                        };
                    } else {
                        const timer = this.getMinutesBefore(time, alarm.spawn);
                        return {
                            itemId: alarm.itemId,
                            display: this.getTimerString(this.etime.toEarthTime(timer)),
                            time: timer,
                            slot: alarm.slot,
                            zoneId: alarm.zoneId,
                            coords: alarm.coords,
                            areaId: alarm.areaId,
                            type: alarm.type,
                            alarm: alarm,
                        };
                    }
                });
            }));
    }

    public getAlarmTimerString(alarm: Alarm, time: Date): string {
        let timer: number;
        if (this._isSpawned(alarm, time)) {
            timer = this.getMinutesBefore(time, (alarm.spawn + alarm.duration) % 24);
        } else {
            timer = this.getMinutesBefore(time, alarm.spawn)
        }
        return this.getTimerString(this.etime.toEarthTime(timer));
    }

    /**
     * Returns the closest alarm at a given time.
     * @param {Alarm[]} alarms
     * @param {Date} time
     * @returns {Alarm}
     */
    public closestAlarm(alarms: Alarm[], time: Date): Alarm {
        return alarms.sort((a, b) => {
            if (this._isSpawned(a, time)) {
                return -1;
            } else if (this._isSpawned(b, time)) {
                return 1;
            } else {
                return this.getMinutesBefore(time, (a.spawn || 24)) > this.getMinutesBefore(time, (b.spawn || 24)) ? 1 : -1;
            }
        })[0]
    }

    public isAlarmSpawned(alarm: Alarm, time: Date): boolean {
        return this._isSpawned(alarm, time);
    }

    /**
     * Formats a given timer to a string;
     * @param {number} timer
     * @returns {string}
     */
    public getTimerString(timer: number): string {
        const seconds = timer % 60;
        const minutes = Math.floor(timer / 60);
        return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
    }

    /**
     * Gets alarms for a given item.
     * @returns {Alarm[]}
     * @param id
     */
    private getAlarms(id: number): Alarm[] {
        const alarms: Alarm[] = [];
        this._alarms.forEach((value, key) => {
            if (key.itemId === id) {
                alarms.push(key);
            }
        });
        return alarms;
    }

    /**
     * Determines if a given alarm is spawned.
     * @param {Alarm} alarm
     * @param {Date} time
     * @returns {boolean}
     * @private
     */
    public _isSpawned(alarm: Alarm, time: Date): boolean {
        let spawn = alarm.spawn;
        let despawn = (spawn + alarm.duration) % 24;
        despawn = despawn === 0 ? 24 : despawn;
        spawn = spawn === 0 ? 24 : spawn;
        // If spawn is greater than despawn, it means that it spawns before midnight and despawns after, which is during the next day.
        const despawnsNextDay = spawn > despawn;
        if (!despawnsNextDay) {
            return time.getUTCHours() >= spawn && time.getUTCHours() < despawn;
        } else {
            return time.getUTCHours() >= spawn || time.getUTCHours() < despawn;
        }
    }

    /**
     * Determines if a given node is spawned or not.
     * @param {ListRow} item
     * @returns {Observable<boolean>}
     */
    public isSpawned(item: ListRow): Observable<boolean> {
        return this.etime.getEorzeanTime().pipe(
            map(time => {
                let spawned = false;
                this.generateAlarms(item).forEach(alarm => {
                    if (this._isSpawned(alarm, time)) {
                        spawned = true;
                    }
                });
                return spawned;
            }));
    }

    /**
     * Returns an observable of the alert state, for color purposes.
     * @returns {Observable<boolean>}
     * @param id
     */
    public isAlerted(id: number): Observable<boolean> {
        return this.etime.getEorzeanTime().pipe(
            map(time => {
                let alerted = false;
                this.getAlarms(id).forEach(alarm => {
                    alerted = alerted || this.isAlarmAlerted(alarm, time);
                });
                return alerted;
            }));
    }

    public isAlarmAlerted(alarm: Alarm, time: Date) {
        return time.getUTCHours() >= this.substractHours(alarm.spawn, this.settings.alarmHoursBefore) && time.getUTCHours() < alarm.spawn;
    }

    /**
     * Little helper to substract hours and cycle through a day if it's necessary.
     * @param {number} h1
     * @param {number} h2
     * @returns {number}
     */
    substractHours(h1: number, h2: number): number {
        let result = (h1 - h2) % 24;
        if (result < 0) {
            result += 24;
        }
        return result;
    }

    /**
     * Returns the amount of minutes before a given alarm.
     * @param {number} currentTime
     * @param hours
     * @param minutes
     * @returns {number}
     */
    public getMinutesBefore(currentTime: Date, hours: number, minutes = 0): number {
        // Convert 0 to 24 for spawn timers
        if (hours === 0) {
            hours = 24;
        }
        const resHours = hours - currentTime.getUTCHours();
        let resMinutes = resHours * 60 + minutes - currentTime.getUTCMinutes();
        let resSeconds = resHours * 3600 + minutes * 60 - currentTime.getUTCSeconds();
        if (resMinutes < 0) {
            resMinutes += 1440;
        }
        if (resSeconds < 0) {
            resSeconds += 360;
        }
        resMinutes += (resSeconds % 60) / 60;
        return resMinutes;
    }

    /**
     * Persist the current alarms into browser's localstorage.
     */
    private persistAlarms(): void {
        this.userService.getUserData().pipe(
            first(),
            mergeMap((user: AppUser) => {
                user.alarms = Array.from(this._alarms.keys()).map(alarm => {
                    delete alarm.aetheryte$;
                    return alarm;
                });
                return this.userService.set(user.$key, user);
            }),
            first()
        ).subscribe();
    }

    /**
     * Gets a list of currently active alarms.
     * @returns {Alarm[]}
     */
    public get alarms(): Alarm[] {
        return Array.from(this._alarms.keys());
    }
}
