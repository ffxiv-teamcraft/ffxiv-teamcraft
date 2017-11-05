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
        item.gatheredBy.nodes.forEach(node => {
            node.time.forEach(spawn => {
                this._register({spawn: spawn, duration: node.uptime, item: item});
            })
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
            if (key.item.id === item.id) {
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
        this.alarms.forEach((value, key) => {
            if (key.item.id === item.id) {
                value.unsubscribe();
                this.alarms.delete(key);
            }
        });
    }

    /**
     * Actual implementation of the registration of an alarm object.
     * @param {Alarm} alarms
     * @private
     */
    private _register(...alarms: Alarm[]): void {
        alarms.forEach(alarm => {
            this.alarms.set(alarm, this.etime.getEorzeanTime().subscribe(time => {
                if (time.getUTCHours() + this.settings.alarmHoursBefore === alarm.spawn) {
                    this.playAlarm(alarm);
                }
            }));
        });
        this.persistAlarms();
    }

    /**
     * Plays the alarm (audio + snack).
     * @param {Alarm} alarm
     */
    private playAlarm(alarm: Alarm): void {
        this.snack.open(this.translator.instant('ALARM.Spawned',
                        this.localizedData.getItem(alarm.item.id)[this.translator.currentLang]),
            '',
            {duration: 5000});
        const audio = new Audio(`/assets/audio/${this.settings.alarmSound}.mp3`);
        audio.loop = false;
        audio.volume = this.settings.alarmVolume;
        audio.play();
    }

    // TODO
    // public get nextSpawnLocation(): string {
    //     return this.i18n.getName(this.localizedData.getPlace(this.nextSpawnZoneId));
    // }

    /**
     * Return the amount of minutes before the next alarm of the item.
     * @param {ListRow} item
     * @returns {Observable<number>}
     */
    public getTimer(item: ListRow): Observable<number> {
        // TODO
    }

    /**
     * Returns the amount of minutes before a given alarm.
     * @param {Alarm} alarm
     * @param {number} currentTime
     * @returns {number}
     */
    private getMinutesBeforeSpawn(alarm: Alarm, currentTime: Date): number {
        const resHours = alarm.spawn - currentTime.getUTCHours();
        let resMinutes = resHours * 60 - currentTime.getUTCMinutes();
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
        localStorage.setItem(AlarmService.LOCALSTORAGE_KEY, JSON.stringify(this.alarms));
    }
}
