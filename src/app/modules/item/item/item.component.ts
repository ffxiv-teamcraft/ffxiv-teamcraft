import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
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
import {BellNodesService} from '../../../core/data/bell-nodes.service';
import {Alarm} from '../../../core/time/alarm';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';
import {DataService} from '../../../core/api/data.service';
import {UserService} from '../../../core/database/user.service';
import {folklores} from '../../../core/data/sources/folklores';
import {VentureDetailsPopupComponent} from '../venture-details-popup/venture-details-popup.component';
import {CraftedBy} from '../../../model/list/crafted-by';
import {Permissions} from '../../../core/database/permissions/permissions';
import {CraftingRotationService} from '../../../core/database/crafting-rotation.service';
import {CraftingRotation} from '../../../model/other/crafting-rotation';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent extends ComponentWithSubscriptions implements OnInit, OnChanges {

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
        35: 20, // Creation
        36: 20, // Mendacity
        7811: 20, // Rowena's Token (Soldiery)
        9383: 20, // Rowena's Token (Poetics)
        14298: 20, // Rowena's Token (Lore)
        16928: 20, // Rowena's Token (Scripture)
        19107: 20, // Rowena's Token (Creation)
        21789: 20, // Rowena's Token (Mendacity)
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
        21081: 13, // Kojin
        21935: 13, // Ananta
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
        21773: 10, // Byakko
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
        21774: 8, // Sigmascape Lens
        21775: 8, // Sigmascape Shaft
        21776: 8, // Sigmascape Crank
        21777: 8, // Sigmascape Spring
        21778: 8, // Sigmascape Pedal
        21779: 8, // Sigmascape Chain
        21780: 8, // Sigmascape Bolt
        21781: 8, // Sigmascape Datalog v1.0
        21782: 8, // Sigmascape Datalog v2.0
        21783: 8, // Sigmascape Datalog v3.0
        21784: 8, // Sigmascape Datalog v4.0
        21785: 8, // Sigmascape Crystalloid
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

    @Input()
    permissions: Permissions;

    requiredForFinalCraft = 0;

    slot: number;

    canBeCrafted = false;

    hasTimers = false;

    hasBook = true;

    /**
     * Expansion is the state of the "add amount" input field (shown or not).
     */
    expanded = false;

    addition = 0;

    masterbooks: CompactMasterbook[] = [];

    folkloreId: number;

    isMobile = this.media.asObservable().map(mediaChange => mediaChange.mqAlias === 'xs' || mediaChange.mqAlias === 'sm');

    public timers: Observable<Timer[]>;

    worksOnIt: any;

    public tradeIcon: number;

    rotations$: Observable<CraftingRotation[]>;

    constructor(private i18n: I18nToolsService,
                private dialog: MatDialog,
                private media: ObservableMedia,
                private localizedData: LocalizedDataService,
                private snackBar: MatSnackBar,
                private translator: TranslateService,
                private alarmService: AlarmService,
                public settings: SettingsService,
                private bellNodesService: BellNodesService,
                private etime: EorzeanTimeService,
                private dataService: DataService,
                private userService: UserService,
                public cd: ChangeDetectorRef,
                private rotationsService: CraftingRotationService) {
        super();
        this.rotations$ = this.userService.getUserData().mergeMap(user => {
            return this.rotationsService.getUserRotations(user.$key);
        }).publishReplay(1).refCount();
    }

    isDraft(): boolean {
        return this.item.id.toString().indexOf('draft') > -1;
    }

    getCraft(recipeId: string): CraftedBy {
        return this.item.craftedBy.find(craft => {
            return craft.recipeId === recipeId
        });
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

    public afterIsearchCopy(id: number): void {
        this.snackBar.open(
            this.translator.instant('Isearch_copied',
                {itemname: this.localizedData.getItem(id)[this.translator.currentLang]}),
            '',
            {
                duration: 2000,
                extraClasses: ['snack']
            }
        );
    }

    ngOnInit(): void {
        this.updateCanBeCrafted();
        this.updateTradeIcon();
        this.updateHasTimers();
        this.updateMasterBooks();
        this.updateTimers();
        this.updateHasBook();
        this.updateRequiredForEndCraft();
        if (this.item.workingOnIt !== undefined) {
            this.userService.get(this.item.workingOnIt)
                .mergeMap(user => this.dataService.getCharacter(user.lodestoneId)).first().subscribe(char => {
                this.worksOnIt = char;
                this.cd.detectChanges();
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.updateCanBeCrafted();
        this.updateTradeIcon();
        this.updateHasTimers();
        this.updateMasterBooks();
        this.updateTimers();
        this.updateHasBook();
        this.updateRequiredForEndCraft();
        if (this.item.workingOnIt !== undefined && (this.worksOnIt === undefined || this.worksOnIt.id !== this.item.workingOnIt)) {
            this.userService.get(this.item.workingOnIt)
                .mergeMap(user => this.dataService.getCharacter(user.lodestoneId)).first().subscribe(char => this.worksOnIt = char);
        }
    }

    public workOnIt(): void {
        this.item.workingOnIt = this.user.$key;
        this.update.emit();
        this.userService.get(this.item.workingOnIt)
            .mergeMap(user => this.dataService.getCharacter(user.lodestoneId))
            .first()
            .subscribe(char => {
                this.worksOnIt = char;
                this.cd.detectChanges();
            });
    }

    public removeWorkingOnIt(): void {
        delete this.item.workingOnIt;
        this.update.emit();
    }

    public getTimerIcon(type: number): string {
        return [
            '/assets/icons/Mineral_Deposit.png',
            '/assets/icons/MIN.png',
            '/assets/icons/Mature_Tree.png',
            '/assets/icons/BTN.png',
            'https://garlandtools.org/db/images/FSH.png'
        ][type];
    }

    /**
     * Adds addition value to current done amount.
     */
    public addAddition() {
        this.setDone(this.item, this.item.done + this.addition, this.item.done);
        this.expanded = !this.expanded;
        this.addition = 0;
    }

    /**
     * Removes addition value to current done amount.
     */
    public removeAddition() {
        this.setDone(this.item, this.item.done - this.addition, this.item.done);
        this.expanded = !this.expanded;
        this.addition = 0;
    }

    public getTimerColor(alarm: Alarm): Observable<string> {
        return this.etime.getEorzeanTime().map(time => {
            if (this.alarmService.isAlarmSpawned(alarm, time)) {
                return 'primary';
            }
            if (this.alarmService.isAlarmAlerted(alarm, time)) {
                return 'accent';
            }
            return '';
        })
    }

    updateCanBeCrafted(): void {
        // this.item.done < this.item.amount check is made to avoid item being cmarked as craftable while you already crafted it.
        this.canBeCrafted = this.list.canBeCrafted(this.item) && this.item.done < this.item.amount;
    }

    updateRequiredForEndCraft(): void {
        const recipesNeedingItem = this.list.recipes
            .filter(recipe => recipe.requires.find(req => req.id === this.item.id) !== undefined);
        if (recipesNeedingItem.length === 0) {
            this.requiredForFinalCraft = 0;
        } else {
            let count = 0;
            recipesNeedingItem.forEach(recipe => {
                count += recipe.requires.find(req => req.id === this.item.id).amount * recipe.amount;
            });
            this.requiredForFinalCraft = count;
        }
    }

    toggleAlarm(id: number, type?: number): void {
        if (this.alarmService.hasAlarm(id)) {
            this.alarmService.unregister(id);
        } else {
            if (type > 0) {
                const alarms = this.alarmService.generateAlarms(this.item).filter(alarm => alarm.type === type);
                this.alarmService.registerAlarms(...alarms);
            } else {
                this.alarmService.register(this.item);
            }
        }
    }

    public hasAlarm(itemId: number): boolean {
        return this.alarmService.hasAlarm(itemId);
    }

    updateHasTimers(): void {
        const hasTimersFromNodes = this.item.gatheredBy !== undefined && this.item.gatheredBy.nodes !== undefined &&
            this.item.gatheredBy.nodes.filter(node => node.time !== undefined).length > 0;
        const hasTimersFromReductions = this.item.reducedFrom !== undefined && [].concat.apply([], this.item.reducedFrom
            .map(reduction => {
                if (reduction.obj !== undefined) {
                    return reduction.obj.i;
                }
                return reduction;
            })
            .map(reduction => this.bellNodesService.getNodesByItemId(reduction))).length > 0;
        this.hasTimers = hasTimersFromNodes || hasTimersFromReductions;
    }

    openRequirementsPopup(): void {
        this.dialog.open(RequirementsPopupComponent, {data: {item: this.item, list: this.list}});
    }

    getAmount(): number {
        return this.item.craftedBy !== undefined ? this.item.amount : this.item.amount_needed;
    }

    public updateMasterBooks(): void {
        const res: CompactMasterbook[] = [];
        if (this.item.craftedBy !== undefined) {
            for (const craft of this.item.craftedBy) {
                if (craft.masterbook !== undefined) {
                    if (res.find(m => m.id === craft.masterbook.id) === undefined) {
                        res.push(craft.masterbook);
                    }
                }
            }
        }
        this.masterbooks = res;
    }

    public updateHasBook(): boolean {
        // If we're loading the user or he's undefined, we can't provide this service so we assume he can craft it.
        if (this.user === undefined || this.user.anonymous) {
            this.hasBook = true;
            return;
        }
        // If this is a craft
        if (this.item.craftedBy !== undefined) {
            const books = this.masterbooks;
            // If there's no book for this item, it means that the user can craft it for sure.
            if (books.length === 0) {
                this.hasBook = true;
                return;
            }
            // If the user has at least one of the required books, it's okay.
            for (const book of books) {
                if ((this.user.masterbooks || []).indexOf(book.id) > -1 || book.id.toString().indexOf('draft') > -1) {
                    this.hasBook = true;
                    return;
                }
            }
            // Else, he can't craft the item, put a warning on it.
            this.hasBook = false;
            return;
        }
        // If this is a gathering (BTN/MIN)
        if (this.item.gatheredBy !== undefined && this.item.gatheredBy.nodes.length > 0) {
            // If it has a limit set to legendary
            const folkloreId = Object.keys(folklores).find(id => folklores[id].indexOf(this.item.id) > -1);
            if (folkloreId !== undefined) {
                this.hasBook = (this.user.masterbooks || []).indexOf(+folkloreId) > -1;
                this.folkloreId = +folkloreId;
                return;
            }
        }
        this.hasBook = true;
        return;
    }

    public setDone(row: ListRow, amount: number, done: number) {
        this.done.emit({row: row, amount: MathTools.absoluteCeil(amount - done), preCraft: this.preCraft});
    }

    public updateTimers(): void {
        if (this.hasTimers) {
            this.timers = this.alarmService.getTimers(this.item);
        }
    }

    public trackByTimers(index: number, timer: Timer) {
        return timer.itemId;
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

    public openVentureDetails(item: ListRow): void {
        this.dialog.open(VentureDetailsPopupComponent, {
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

    public updateTradeIcon(): void {
        if (this.item.tradeSources !== undefined) {
            const res = {priority: 0, icon: 0};
            this.item.tradeSources.forEach(ts => {
                ts.trades.forEach(trade => {
                    const id = trade.currencyId;
                    if (ItemComponent.TRADE_SOURCES_PRIORITIES[id] !== undefined &&
                        ItemComponent.TRADE_SOURCES_PRIORITIES[id] > res.priority) {
                        res.icon = trade.currencyIcon;
                        res.priority = ItemComponent.TRADE_SOURCES_PRIORITIES[id];
                    }
                });
            });
            this.tradeIcon = res.icon;
        }
    }

    public openTradeDetails(item: ListRow): void {
        this.dialog.open(TradeDetailsPopupComponent, {
            data: item
        });
    }

}
