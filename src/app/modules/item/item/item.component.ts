import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
import {TranslateService} from '@ngx-translate/core';
import {AlarmService} from '../../../core/time/alarm.service';
import {Observable} from 'rxjs/Observable';
import {Timer} from '../../../core/time/timer';
import {SettingsService} from '../../../pages/settings/settings.service';
import {AppUser} from '../../../model/list/app-user';
import {UserService} from '../../../core/database/user.service';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ItemComponent extends ComponentWithSubscriptions implements OnInit {

    private static TRADE_SOURCES_PRIORITIES = {
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

    @Input()
    user: AppUser;

    slot: number;

    timerColor = '';

    constructor(private i18n: I18nToolsService,
                private dialog: MatDialog,
                private media: ObservableMedia,
                private localizedData: LocalizedDataService,
                private snackBar: MatSnackBar,
                private translator: TranslateService,
                private alarmService: AlarmService,
                public settings: SettingsService) {
        super();
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
        if (this.hasTimers()) {
            this.subscriptions.push(Observable.combineLatest(this.alarmService.isSpawned(this.item),
                this.alarmService.isAlerted(this.item.id))
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
                })
            );
        }
    }

    toggleAlarm(): void {
        if (this.alarmService.hasAlarm(this.item)) {
            this.alarmService.unregister(this.item.id);
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

    public hasBook(): boolean {
        // If we're loading the user or he's undefined, we can't provide this service so we assume he can craft it.
        if (this.user === undefined || this.user.anonymous) {
            return true;
        }
        // If this is a craft
        if (this.item.craftedBy !== undefined) {
            const books = this.getMasterBooks(this.item);
            // If there's no book for this item, it means that the user can craft it for sure.
            if (books.length === 0) {
                return true;
            }
            // If the user has at least one of the required books, it's okay.
            for (const book of books) {
                if ((this.user.masterbooks || []).indexOf(book.id) > -1) {
                    return true;
                }
            }
            // Else, he can't craft the item, put a warning on it.
            return false;
        }
        return true;
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
                if (ItemComponent.TRADE_SOURCES_PRIORITIES[id] !== undefined && ItemComponent.TRADE_SOURCES_PRIORITIES[id] > res.priority) {
                    res.icon = trade.currencyIcon;
                    res.priority = ItemComponent.TRADE_SOURCES_PRIORITIES[id];
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
