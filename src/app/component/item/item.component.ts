import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ListRow} from '../../model/list/list-row';
import {I18nToolsService} from '../../core/i18n-tools.service';
import {GatheredByPopupComponent} from '../popup/gathered-by-popup/gathered-by-popup.component';
import {MdDialog} from '@angular/material';
import {DropsDetailsPopupComponent} from '../popup/drops-details-popup/drops-details-popup.component';
import {TradeDetailsPopupComponent} from '../popup/trade-details-popup/trade-details-popup.component';
import {I18nName} from '../../model/list/i18n-name';
import {DesynthPopupComponent} from '../popup/desynth-popup/desynth-popup.component';
import {CompactMasterbook} from '../../model/list/compact-masterbook';
import {VendorsDetailsPopupComponent} from '../popup/vendors-details-popup/vendors-details-popup.component';
import {InstancesDetailsPopupComponent} from '../popup/instances-details-popup/instances-details-popup.component';
import {ReductionDetailsPopupComponent} from '../popup/reduction-details-popup/reduction-details-popup.component';
import {MathTools} from '../../tools/math-tools';
import {List} from '../../model/list/list';
import {RequirementsPopupComponent} from '../popup/requirements-popup/requirements-popup.component';
import {ObservableMedia} from '@angular/flex-layout';
import {EorzeanTimeService} from '../../core/time/eorzean-time.service';
import {VoyagesDetailsPopupComponent} from '../popup/voyages-details-popup/voyages-details-popup.component';
import {LocalizedDataService} from '../../core/data/localized-data.service';
import {FishDetailsPopupComponent} from '../popup/fish-details-popup/fish-details-popup.component';
import {AngularFireAuth} from 'angularfire2/auth';
import {UserInfo} from 'firebase/app';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

    @Input()
    item: ListRow;

    @ViewChild('doneInput')
    doneInput: ElementRef;

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    recipe = false;

    @Input()
    list: List;

    @Input()
    showTimer = false;

    @Input()
    even = false;

    user: UserInfo;

    itemUri: string;

    timer: string;

    timerMinutes = 0;

    spawned: boolean;

    spawnAlarm = false;

    slot: number;

    nextSpawnZoneId: number;

    tradeSourcePriorities = {
        // MGP, just in case
        5752: 20,
        // Seals
        20: 18,
        21: 18,
        22: 18,
        27: 18,
        7550: 18,
        // Tomestones
        23: 15,
        24: 15,
        26: 15,
        28: 15,
        10972: 15,
        11252: 15,
        7548: 15,
        7549: 15,
        8285: 15,
        9053: 15,
        // Scripts
        7553: 13,
        7554: 13,
        11090: 13,
        11091: 13,
        // Beast tribe currencies
        8477: 10,
        8267: 10,
        3455: 10,
        3456: 10,
        3457: 10,
        3458: 10,
        3459: 10,
        3460: 10,
        3461: 10,
        3462: 10,
        3463: 10,
        3464: 10,
        3465: 10,
        3466: 10,
        3467: 10,
        3468: 10,
        3469: 10,
        7812: 10,
        // Spoils
        7731: 2
    };

    constructor(private i18n: I18nToolsService,
                private dialog: MdDialog,
                private media: ObservableMedia,
                private etimeService: EorzeanTimeService,
                private localizedData: LocalizedDataService,
                private auth: AngularFireAuth) {
    }

    isDraft(): boolean {
        return this.item.id.toString().indexOf('draft') > -1;
    }

    toggleAlarm(): void {
        this.spawnAlarm = !this.spawnAlarm;
        if (this.spawnAlarm) {
            localStorage.setItem(this.item.id + ':spawnAlarm', this.spawnAlarm.toString());
        } else {
            localStorage.removeItem(this.item.id + ':spawnAlarm');
        }
    }

    public get nextSpawnLocation(): string {
        return this.i18n.getName(this.localizedData.getPlace(this.nextSpawnZoneId));
    }

    ngOnInit(): void {
        this.auth.idToken.subscribe(user => {
            this.user = user;
        });

        this.spawnAlarm = localStorage.getItem(this.item.id + ':spawnAlarm') === 'true' || false;

        const listUri = `/users/${this.list.authorUid}/lists/${this.list.$key}`;
        const listCategory = this.list.getCategory(this.item);
        const index = this.list[listCategory].indexOf(this.item);
        this.itemUri = `${listUri}/${listCategory}/${index}`;

        if (this.hasTimers()) {
            this.etimeService.getEorzeanTime().subscribe(date => {
                const timers = [];
                this.item.gatheredBy.nodes.forEach(node => {
                    node.time.forEach(t => {
                        timers.push({
                            start: this.getTimeUntil(date, t, 0),
                            end: this.getTimeUntil(date, (t + node.uptime / 60) % 24, 0),
                            spawned: this.getTimeUntil(date, (t + node.uptime / 60) % 24, 0) <= node.uptime,
                            zoneid: node.zoneid
                        });
                    });
                    this.slot = node.slot;
                });
                const options = this.getTimerOptions();
                for (const t of timers) {
                    // If the node is spawned
                    if (t.spawned) {
                        this.timerMinutes = t.end;
                        this.nextSpawnZoneId = t.zoneid;
                        if (!this.spawned && this.spawnAlarm && options.hoursBefore === 0 && !this.notified) {
                            this.notify();
                        }
                        this.spawned = true;
                        break;
                    }
                    if (this.timerMinutes / 60 <= options.hoursBefore && !this.notified && this.spawnAlarm) {
                        this.notify();
                    }
                    // If this this.timerMinutes is closer than the actual one
                    if (t.start < this.timerMinutes) {
                        this.timerMinutes = t.start;
                        this.notified = false;
                    }
                    // If we're in the first iteration and the node isn't spawned
                    if (this.timerMinutes === 0 && !t.spawned) {
                        this.timerMinutes = t.start;
                    }
                    this.spawned = t.spawned;
                    this.nextSpawnZoneId = t.zoneid;
                }
                const resultEarthTime = this.etimeService.toEarthTime(this.timerMinutes);
                this.timer = this.getTimerString(resultEarthTime);
            });
        }
    }

    public get notified(): boolean {
        return localStorage.getItem(this.item.id + ':notified') === 'true';
    }

    public set notified(n: boolean) {
        if (n) {
            localStorage.setItem(this.item.id + ':notified', n.toString());
        } else {
            localStorage.removeItem(this.item.id + ':notified');
        }
    }

    public getTimerColor(): string {
        if (this.spawned) {
            return 'primary';
        }
        if (this.notified && this.spawnAlarm) {
            return 'accent';
        }
        return '';
    }

    private getTimerOptions(): any {
        return JSON.parse(localStorage.getItem('timer:settings')) || {
            sound: 'Notification',
            hoursBefore: 0
        };
    }

    notify(): void {
        const audio = new Audio(`/assets/audio/${this.getTimerOptions().sound}.mp3`);
        audio.loop = false;
        audio.play();
        this.notified = true;
    }

    getTimeUntil(currentDate: Date, hours: number, minutes: number): number {
        const resHours = hours - currentDate.getUTCHours();
        let resMinutes = resHours * 60 + minutes - currentDate.getUTCMinutes();
        if (resMinutes < 0) {
            resMinutes += 1440;
        }
        return resMinutes;
    }

    hasTimers(): boolean {
        return this.item.gatheredBy !== undefined && this.item.gatheredBy.nodes !== undefined &&
            this.item.gatheredBy.nodes.filter(node => node.time !== undefined).length > 0;
    }

    getTimerString(timer: number): string {
        const seconds = timer % 60;
        const minutes = Math.floor(timer / 60);
        return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
    }

    openRequirementsPopup(): void {
        this.dialog.open(RequirementsPopupComponent, {data: {item: this.item, list: this.list}});
    }

    getAmount(): number {
        return this.recipe ? this.item.amount : this.item.amount_needed;
    }

    public getMasterBooks(item: ListRow): CompactMasterbook[] {
        const res: CompactMasterbook[] = [];
        for (const craft of item.craftedBy) {
            if (craft.masterbook !== undefined) {
                if (res.find(m => m.id === craft.masterbook.id) === undefined) {
                    res.push(craft.masterbook);
                }
            }
        }
        return res;
    }

    public setDone(row: ListRow, amount: number, done: number) {
        this.done.emit({row: row, amount: MathTools.absoluteCeil(amount - done)});
    }

    public getI18n(name: I18nName) {
        return this.i18n.getName(name);
    }

    public openGatheredByDetails(item: ListRow): void {
        // If it is a MIN/BOT node
        if (item.gatheredBy.type > -1) {
            this.dialog.open(GatheredByPopupComponent, {
                data: item
            });
        } else {
            // Else it's a fish
            this.dialog.open(FishDetailsPopupComponent, {
                data: item
            });
        }
    }

    public openDropsDetails(item: ListRow): void {
        this.dialog.open(DropsDetailsPopupComponent, {
            data: item
        });
    }

    public openDesynthDetails(item: ListRow): void {
        this.dialog.open(DesynthPopupComponent, {
            data: item
        });
    }

    public openVoyagesDetails(item: ListRow): void {
        this.dialog.open(VoyagesDetailsPopupComponent, {
            data: item
        });
    }

    public openReductionDetails(item: ListRow): void {
        this.dialog.open(ReductionDetailsPopupComponent, {
            data: item
        });
    }

    public openInstancesDetails(item: ListRow): void {
        this.dialog.open(InstancesDetailsPopupComponent, {
            data: item
        });
    }

    public openVendorsDetails(item: ListRow): void {
        this.dialog.open(VendorsDetailsPopupComponent, {
            data: item
        });
    }

    public getTradeIcon(item: ListRow): number {
        const res = {priority: 0, icon: 0};
        item.tradeSources.forEach(ts => {
            ts.trades.forEach(trade => {
                const id = trade.currencyIcon;
                if (this.tradeSourcePriorities[id] !== undefined && this.tradeSourcePriorities[id] > res.priority) {
                    res.icon = trade.currencyIcon;
                    res.priority = this.tradeSourcePriorities[id];
                }
            });
        });
        return res.icon;
    }

    public openTradeDetails(item: ListRow): void {
        this.dialog.open(TradeDetailsPopupComponent, {
            data: item
        });
    }

    public get isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }
}
