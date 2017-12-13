import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
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
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent extends ComponentWithSubscriptions implements OnInit {

    private static TRADE_SOURCES_PRIORITIES = {
        // Just in case
        25: 25, // Wolf Mark
        29: 25, // MGP
        // Seals
        20: 23, // Storm
        21: 23, // Serpent
        22: 23, // Flame
        27: 23, // Allied
        10307: 23, // Centurio
        // Tomestones
        28: 20, // Poetics
        34: 20, // Verity
        35: 20, // Creation
        7811: 20, // Rowena's Token (Soldiery)
        9383: 20, // Rowena's Token (Poetics)
        14298: 20, // Rowena's Token (Lore)
        16928: 20, // Rowena's Token (Scripture)
        19107: 20, // Rowena's Token (Creation)
        // Scripts
        10309: 18, // Red crafter
        10311: 18, // Red gatherer
        17833: 18, // Yellow crafter
        17834: 18, // Yellow gatherer
        // Hunt mark log
        7901: 15, // Blood-spattered
        10127: 15, // Unstained
        13625: 15, // Clan
        15918: 15, // Unstained Clan
        17523: 15, // Legendary Clan
        20308: 15, // Veteran's Clan
        21103: 15, // Mythic Clan
        // Beast tribes
        21073: 13, // Ixali
        21074: 13, // Vanu Vanu
        21075: 13, // Sylph
        21076: 13, // Amalj'aa
        21077: 13, // Sahagin
        21078: 13, // Kobold
        21079: 13, // Vath
        21080: 13, // Moogle
        21081: 13, // Kojins
        // Primals
        7004: 10, // Weekly quest Garuda/Titan/Ifrit
        7850: 10, // Leviathan
        9559: 10, // Shiva
        12672: 10, // Bismarck
        12673: 10, // Ravana
        13627: 10, // Thordan
        14300: 10, // Sephirot
        15421: 10, // Nidhogg
        16188: 10, // Sophia
        17461: 10, // Zurvan
        19109: 10, // Susano
        19110: 10, // Lakshmi
        21196: 10, // Shinryu
        // Raids
        7577: 8, // Sands of Time
        7578: 8, // Oil of Time
        7812: 8, // Unidentified Allagan Tomestone
        9384: 8, // Encrypted Tomestone
        9385: 8, // Carboncoat
        9386: 8, // Carbontwine
        10325: 8, // Illuminati Gobdip
        10326: 8, // Illuminati Gobtwine
        10327: 8, // Illuminati Gobcoat
        12674: 8, // Tarnished Gordian Lens
        12675: 8, // Tarnished Gordian Shaft
        12676: 8, // Tarnished Gordian Crank
        12677: 8, // Tarnished Gordian Spring
        12678: 8, // Tarnished Gordian Pedal
        12679: 8, // Tarnished Gordian Chain
        12680: 8, // Tarnished Gordian Bolt
        12681: 8, // Gordian Manifesto - Page 1
        12682: 8, // Gordian Manifesto - Page 2
        12683: 8, // Gordian Manifesto - Page 3
        12684: 8, // Gordian Manifesto - Page 4
        13626: 8, // Mhachi Farthing
        14299: 8, // High-capacity Tomestone
        14301: 8, // Tarnished Midan Lens
        14302: 8, // Tarnished Midan Shaft
        14303: 8, // Tarnished Midan Crank
        14304: 8, // Tarnished Midan Spring
        14305: 8, // Tarnished Midan Pedal
        14306: 8, // Tarnished Midan Chain
        14307: 8, // Tarnished Midan Bolt
        14308: 8, // Midan Manifesto - Page 1
        14309: 8, // Midan Manifesto - Page 2
        14310: 8, // Midan Manifesto - Page 3
        14311: 8, // Midan Manifesto - Page 4
        14895: 8, // Midan Gear
        14896: 8, // Illuminati Deep Gobdip
        14897: 8, // Illuminati Taut Gobtwine
        14898: 8, // Illuminati Dark Gobcoat
        15947: 8, // Mhachi Penny
        16541: 8, // Micro Tomestone
        16542: 8, // Illuminati Darkest Gobcoat
        16543: 8, // Illuminati Tautest Gobtwine
        16544: 8, // Illuminati Deepest Gobdip
        16545: 8, // Alexandrian Gear
        16546: 8, // Tarnished Alexandrian Lens
        16547: 8, // Tarnished Alexandrian Shaft
        16548: 8, // Tarnished Alexandrian Crank
        16549: 8, // Tarnished Alexandrian Spring
        16550: 8, // Tarnished Alexandrian Pedal
        16551: 8, // Tarnished Alexandrian Chain
        16552: 8, // Tarnished Alexandrian Bolt
        16553: 8, // Alexandrian Manifesto - Page 1
        16554: 8, // Alexandrian Manifesto - Page 2
        16555: 8, // Alexandrian Manifesto - Page 3
        16556: 8, // Alexandrian Manifesto - Page 4
        17595: 8, // Mhachi Shilling
        19104: 8, // Lost Allagan Roborant
        19105: 8, // Lost Allagan Twine
        19106: 8, // Lost Allagan Glaze
        19108: 8, // Early Model Tomestone
        19111: 8, // Deltascape Lens
        19112: 8, // Deltascape Shaft
        19113: 8, // Deltascape Crank
        19114: 8, // Deltascape Spring
        19115: 8, // Deltascape Pedal
        19116: 8, // Deltascape Chain
        19117: 8, // Deltascape Bolt
        19118: 8, // Deltascape Datalog v1.0
        19119: 8, // Deltascape Datalog v2.0
        19120: 8, // Deltascape Datalog v3.0
        19121: 8, // Deltascape Datalog v4.0
        19122: 8, // Deltascape Crystalloid
        21197: 8, // Dreadwyrm Totem
        21198: 8, // Rabanastran Coin
        // World bosses
        6155: 5, // Behemoth
        6164: 5, // Odin
        12252: 5, // Coeurlregina
        12253: 5, // Proto Ultima
        20521: 5, // Tamamo-no-Gozen
        20638: 5, // Ixion
        // Gardening
        15857: 3, // Althyk Lavender
        15858: 3, // Voidrake
        // Spoils
        13630: 1, // Brass
        13631: 1 // Steel
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
    preCraft = false;

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
                public settings: SettingsService,
                public cd: ChangeDetectorRef) {
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

    canBeCrafted(): boolean {
        // this.item.done < this.item.amount check is made to avoid item being cmarked as craftable while you already crafted it.
        return this.list.canBeCrafted(this.item) && this.item.done < this.item.amount;
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
        this.done.emit({row: row, amount: MathTools.absoluteCeil(amount - done), preCraft: this.preCraft});
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
                const id = trade.currencyId;
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
