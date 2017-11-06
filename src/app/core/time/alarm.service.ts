import {Injectable} from '@angular/core';
import {EorzeanTimeService} from './eorzean-time.service';
import {Alarm} from './alarm';
import {Subscription} from 'rxjs/Subscription';
import {ListRow} from '../../model/list/list-row';
import {SettingsService} from '../../modules/settings/settings.service';
import {MatSnackBar} from '@angular/material';
import {LocalizedDataService} from '../data/localized-data.service';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs/Observable';
import {Timer} from 'app/core/time/timer';

@Injectable()
export class AlarmService {

    private static LOCALSTORAGE_KEY = 'alarms';

    private alarms: Map<Alarm, Subscription> = new Map<Alarm, Subscription>();

    constructor(private etime: EorzeanTimeService, private settings: SettingsService, private snack: MatSnackBar,
                private localizedData: LocalizedDataService, private translator: TranslateService) {
        this.loadAlarms();
    }

    /**
     * Registers a given item and creates an alarm for it.
     * @param {ListRow} item
     */
    public register(item: ListRow): void {
        if (!this.itemHasTimedNodes(item)) {
            return;
        }
        this.generateAlarms(item).forEach(alarm => {
            this._register(alarm);
        });
    }

    /**
     * Determines if a given item has an activated alarm or not.
     * @param {ListRow} item
     * @returns {boolean}
     */
    public hasAlarm(item: ListRow): boolean {
        let res = false;
        this.alarms.forEach((value, key) => {
            if (key.itemId === item.id) {
                res = true;
            }
        });
        return res;
    }

    /**
     * Unregisters a given item alarm by finding it, then unregisters the subscription, and finally deletes the entry from the alarms.
     * @param {ListRow} item
     */
    public unregister(item: ListRow): void {
        this.getAlarms(item).forEach((alarm) => {
            this.alarms.get(alarm).unsubscribe();
            this.alarms.delete(alarm);
        });
        this.persistAlarms();
    }

    /**
     * Actual implementation of the registration of an alarm object.
     * @param {Alarm} alarms
     * @private
     */
    private _register(...alarms: Alarm[]): void {
        alarms.forEach(alarm => {
            this.alarms.set(alarm, this.etime.getEorzeanTime().subscribe(time => {
                if (time.getUTCHours() === this.substractHours(alarm.spawn, this.settings.alarmHoursBefore) && time.getUTCMinutes() === 0) {
                    this.playAlarm(alarm);
                }
            }));
        });
        this.persistAlarms();
    }

    /**
     * Gets alarm entries for a given item based on node spawns and uptime.
     * @param {ListRow} item
     * @private
     */
    private generateAlarms(item: ListRow): Alarm[] {
        const alarms: Alarm[] = [];
        if (item.gatheredBy === undefined) {
            return [];
        }
        item.gatheredBy.nodes.forEach(node => {
            if (node.time !== undefined) {
                node.time.forEach(spawn => {
                    alarms.push({
                        spawn: spawn, duration: node.uptime / 60, itemId: item.id, slot: node.slot,
                        areaId: node.areaid, coords: node.coords, zoneId: node.zoneid
                    });
                });
            }
        });
        return alarms;
    }

    /**
     * Plays the alarm (audio + snack).
     * @param {Alarm} alarm
     */
    private playAlarm(alarm: Alarm): void {
        this.snack.open(this.translator.instant('ALARM.Spawned',
            this.localizedData.getItem(alarm.itemId)[this.translator.currentLang]),
            '',
            {duration: 5000});
        const audio = new Audio(`/assets/audio/${this.settings.alarmSound}.mp3`);
        audio.loop = false;
        audio.volume = this.settings.alarmVolume;
        audio.play();
    }

    /**
     * Return the amount of minutes before the next alarm of the item.
     * @param {ListRow} item
     * @returns {Observable<number>}
     */
    public getTimer(item: ListRow): Observable<Timer> {
        return this.etime.getEorzeanTime().map(time => {
            const alarm = this.generateAlarms(item).sort((a, b) => {
                if (this._isSpawned(a, time)) {
                    return -1;
                } else if (this._isSpawned(b, time)) {
                    return 1;
                } else {
                    return this.getMinutesBefore(time, a.spawn) > this.getMinutesBefore(time, b.spawn) ? 1 : -1;
                }
            })[0];
            if (this._isSpawned(alarm, time)) {
                const timer = this.getMinutesBefore(time, (alarm.spawn + alarm.duration) % 24);
                return {
                    display: this.getTimerString(this.etime.toEarthTime(timer)), time: timer, slot: alarm.slot,
                    zoneId: alarm.zoneId, coords: alarm.coords, areaId: alarm.areaId
                };
            } else {
                const timer = this.getMinutesBefore(time, alarm.spawn);
                return {
                    display: this.getTimerString(this.etime.toEarthTime(timer)), time: timer, slot: alarm.slot,
                    zoneId: alarm.zoneId, coords: alarm.coords, areaId: alarm.areaId
                };
            }
        });
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
     * @param {ListRow} item
     * @returns {Alarm[]}
     */
    private getAlarms(item: ListRow): Alarm[] {
        const alarms: Alarm[] = [];
        this.alarms.forEach((value, key) => {
            if (key.itemId === item.id) {
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
    private _isSpawned(alarm: Alarm, time: Date): boolean {
        return time.getUTCHours() >= alarm.spawn && time.getUTCHours() < (alarm.spawn + alarm.duration) % 24;
    }

    /**
     * Determines if a given node is spawned or not.
     * @param {ListRow} item
     * @returns {Observable<boolean>}
     */
    public isSpawned(item: ListRow): Observable<boolean> {
        return this.etime.getEorzeanTime().map(time => {
            let spawned = false;
            this.generateAlarms(item).forEach(alarm => {
                if (this._isSpawned(alarm, time)) {
                    spawned = true;
                }
            });
            return spawned;
        });
    }

    /**
     * Returns an observable of the alert state, for color purposes.
     * @param {ListRow} item
     * @returns {Observable<boolean>}
     */
    public isAlerted(item: ListRow): Observable<boolean> {
        return this.etime.getEorzeanTime().map(time => {
            let alerted = false;
            this.getAlarms(item).forEach(alarm => {
                if (time.getUTCHours() > this.substractHours(alarm.spawn,
                        this.settings.alarmHoursBefore) && time.getUTCHours() < alarm.spawn) {
                    alerted = true;
                }
            });
            return alerted;
        })
    }

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
    private getMinutesBefore(currentTime: Date, hours: number, minutes = 0): number {
        const resHours = hours - currentTime.getUTCHours();
        let resMinutes = resHours * 60 + minutes - currentTime.getUTCMinutes();
        if (resMinutes < 0) {
            resMinutes += 1440;
        }
        return resMinutes;
    }

    /**
     * Checks wether an item has timers or not, should never return false but still here as a security.
     * @param {ListRow} item
     * @returns {boolean}
     */
    private itemHasTimedNodes(item: ListRow): boolean {
        return item.gatheredBy !== undefined && item.gatheredBy.nodes !== undefined &&
            item.gatheredBy.nodes.filter(node => node.time !== undefined).length > 0;
    }

    /**
     * Loads alarms fro the local storage of the browser.
     */
    private loadAlarms(): void {
        this._register(...(JSON.parse(localStorage.getItem(AlarmService.LOCALSTORAGE_KEY)) || []));
    }

    /**
     * Persist the current alarms into browser's localstorage.
     */
    private persistAlarms(): void {
        localStorage.setItem(AlarmService.LOCALSTORAGE_KEY, JSON.stringify(Array.from(this.alarms.keys())));
    }
}
