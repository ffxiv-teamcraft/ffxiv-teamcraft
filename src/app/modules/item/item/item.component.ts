import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ListRow} from '../../../model/list/list-row';
import {I18nToolsService} from '../../../core/tools/i18n-tools.service';
import {GatheredByPopupComponent} from '../gathered-by-popup/gathered-by-popup.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DropsDetailsPopupComponent} from '../drops-details-popup/drops-details-popup.component';
import {TradeDetailsPopupComponent} from '../trade-details-popup/trade-details-popup.component';
import {I18nName} from '../../../model/list/i18n-name';
import {DesynthPopupComponent} from '../desynth-popup/desynth-popup.component';
import {CompactMasterbook} from '../../../model/list/compact-masterbook';
import {VendorsDetailsPopupComponent} from '../vendors-details-popup/vendors-details-popup.component';
import {InstancesDetailsPopupComponent} from '../instances-details-popup/instances-details-popup.component';
import {ReductionDetailsPopupComponent} from '../reduction-details-popup/reduction-details-popup.component';
import {MathTools} from '../../../tools/math-tools';
import {List} from '../../../model/list/list';
import {RequirementsPopupComponent} from '../requirements-popup/requirements-popup.component';
import {ObservableMedia} from '@angular/flex-layout';
import {VoyagesDetailsPopupComponent} from '../voyages-details-popup/voyages-details-popup.component';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {FishDetailsPopupComponent} from '../fish-details-popup/fish-details-popup.component';
import {AngularFireAuth} from 'angularfire2/auth';
import {UserInfo} from 'firebase/app';
import {TranslateService} from '@ngx-translate/core';
import {AlarmService} from '../../../core/time/alarm.service';
import {Observable} from 'rxjs/Observable';
import {Timer} from '../../../core/time/timer';

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

    slot: number;

    timerColor = '';

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
                private dialog: MatDialog,
                private media: ObservableMedia,
                private localizedData: LocalizedDataService,
                private auth: AngularFireAuth,
                private snackBar: MatSnackBar,
                private translator: TranslateService,
                private alarmService: AlarmService) {
    }

    isDraft(): boolean {
        return this.item.id.toString().indexOf('draft') > -1;
    }

    public afterNameCopy(id: number): void {
        this.snackBar.open(
            this.translator.instant('Item_name_copied',
                {itemname: this.localizedData.getItem(id)[this.translator.currentLang]}),
            '',
            {
                duration: 2000,
                extraClasses: ['snack']
            }
        );
    }

    ngOnInit(): void {
        this.auth.authState.subscribe(user => {
            this.user = user;
        });

        Observable.combineLatest(this.alarmService.isSpawned(this.item), this.alarmService.isAlerted(this.item))
            .subscribe((result) => {
                const spawned = result[0];
                const alerted = result[1];
                if (spawned) {
                    this.timerColor = 'primary';
                } else if (alerted) {
                    this.timerColor = 'accent';
                } else {
                    this.timerColor = '';
                }
            });

        // TODO update this for betetr management for comments.
        const listUri = `/lists/${this.list.$key}`;
        const listCategory = this.list.getCategory(this.item);
        const index = this.list[listCategory].indexOf(this.item);
        this.itemUri = `${listUri}/${listCategory}/${index}`;
    }

    toggleAlarm(): void {
        if (this.alarmService.hasAlarm(this.item)) {
            this.alarmService.unregister(this.item);
        } else {
            this.alarmService.register(this.item);
        }
    }

    public get spawnAlarm(): boolean {
        return this.alarmService.hasAlarm(this.item);
    }

    hasTimers(): boolean {
        return this.item.gatheredBy !== undefined && this.item.gatheredBy.nodes !== undefined &&
            this.item.gatheredBy.nodes.filter(node => node.time !== undefined).length > 0;
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

    public getTimer(): Observable<Timer> {
        return this.alarmService.getTimer(this.item);
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
