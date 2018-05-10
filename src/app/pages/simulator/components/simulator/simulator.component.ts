import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Craft} from '../../../../model/garland-tools/craft';
import {Simulation} from '../../simulation/simulation';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {CraftingAction} from '../../model/actions/crafting-action';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CrafterStats} from '../../model/crafter-stats';
import {SimulationReliabilityReport} from '../../simulation/simulation-reliability-report';
import {SimulationResult} from '../../simulation/simulation-result';
import {ActionType} from '../../model/actions/action-type';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';
import {ObservableMedia} from '@angular/flex-layout';
import {GearSet} from '../../model/gear-set';
import {UserService} from '../../../../core/database/user.service';
import {DataService} from '../../../../core/api/data.service';
import {HtmlToolsService} from '../../../../core/tools/html-tools.service';
import {EffectiveBuff} from '../../model/effective-buff';
import {Buff} from 'app/pages/simulator/model/buff.enum';
import {Consumable} from '../../model/consumable';
import {foods} from '../../../../core/data/sources/foods';
import {medicines} from '../../../../core/data/sources/medicines';
import {BonusType} from '../../model/consumable-bonus';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';
import {CustomCraftingRotation} from '../../../../model/other/custom-crafting-rotation';
import {MatDialog} from '@angular/material';
import {ImportRotationPopupComponent} from '../import-rotation-popup/import-rotation-popup.component';
import {MacroPopupComponent} from '../macro-popup/macro-popup.component';
import {PendingChangesService} from 'app/core/database/pending-changes/pending-changes.service';
import {SimulationMinStatsPopupComponent} from '../simulation-min-stats-popup/simulation-min-stats-popup.component';
import {ImportMacroPopupComponent} from '../import-macro-popup/import-macro-popup.component';
import {LocalizedDataService} from '../../../../core/data/localized-data.service';
import {TranslateService} from '@ngx-translate/core';
import {Language} from 'app/core/data/language';
import {ConsumablesService} from 'app/pages/simulator/model/consumables.service';
import {I18nToolsService} from '../../../../core/tools/i18n-tools.service';
import {AppUser} from 'app/model/list/app-user';

@Component({
    selector: 'app-simulator',
    templateUrl: './simulator.component.html',
    styleUrls: ['./simulator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent implements OnInit, OnDestroy {

    @Input()
    itemId: number;

    @Input()
    itemIcon: number;

    @Input()
    public customMode = false;

    private recipe$: ReplaySubject<Craft> = new ReplaySubject<Craft>(1);

    @Input()
    public set recipe(recipe: Craft) {
        this.recipe$.next(recipe);
    }

    private crafterStats$: ReplaySubject<CrafterStats> = new ReplaySubject<CrafterStats>(1);

    @Input()
    public set crafterStats(stats: CrafterStats) {
        this.crafterStats$.next(stats);
    }

    public actions$: BehaviorSubject<CraftingAction[]> = new BehaviorSubject<CraftingAction[]>([]);

    @Input()
    public set actions(actions: CraftingAction[]) {
        this.actions$.next(actions);
    }

    private hqIngredients$: BehaviorSubject<{ id: number, amount: number }[]> =
        new BehaviorSubject<{ id: number, amount: number }[]>([]);

    @Input()
    public set hqIngredients(ingredients: { id: number, amount: number }[]) {
        this.hqIngredients$.next(ingredients);
    }

    @Input()
    canSave = true;

    @Output()
    public onsave: EventEmitter<Partial<CraftingRotation>> = new EventEmitter<Partial<CraftingRotation>>();

    public simulation$: Observable<Simulation>;

    public result$: Observable<SimulationResult>;

    public report$: Observable<SimulationReliabilityReport>;

    public gearsets$: Observable<GearSet[]>;

    public customSet = false;

    public selectedSet: GearSet;

    @Input()
    public set inputGearSet(set: GearSet) {
        if (set !== undefined) {
            this.selectedSet = set;
            this.applyStats(set, false);
        }
    }

    @Input()
    public rotationId: string;

    public hqIngredientsData: { id: number, amount: number, max: number, quality: number }[] = [];

    public foods: Consumable[] = [];

    @Input()
    public set selectedFood(food: Consumable) {
        this._selectedFood = food;
        this.applyStats(this.selectedSet, false);
    }

    public _selectedFood: Consumable;

    public medicines: Consumable[] = [];

    @Input()
    public set selectedMedicine(medicine: Consumable) {
        this._selectedMedicine = medicine;
        this.applyStats(this.selectedSet, false);
    }

    public _selectedMedicine: Consumable;

    private serializedRotation: string[];

    private recipeSync: Craft;

    public snapshotStep$: BehaviorSubject<number> = new BehaviorSubject<number>(Infinity);

    public snapshotMode = false;

    public dirty = false;

    private findActionsRegex: RegExp =
        new RegExp(/\/(ac|action)[\s]+(([\w]+)|"([^"]+)")?.*/, 'i');

    private findActionsAutoTranslatedRegex: RegExp =
        new RegExp(/\/(ac|action)[\s]+([^<]+)?.*/, 'i');

    private userData: AppUser;

    constructor(private registry: CraftingActionsRegistry, private media: ObservableMedia, private userService: UserService,
                private dataService: DataService, private htmlTools: HtmlToolsService, private dialog: MatDialog,
                private pendingChanges: PendingChangesService, private localizedDataService: LocalizedDataService,
                private translate: TranslateService, consumablesService: ConsumablesService, i18nTools: I18nToolsService) {

        this.foods = consumablesService.fromData(foods)
            .sort((a, b) => {
                const aName = i18nTools.getName(this.localizedDataService.getItem(a.itemId));
                const bName = i18nTools.getName(this.localizedDataService.getItem(b.itemId));
                return aName > bName || !a.hq ? 1 : -1;
            });
        this.medicines = consumablesService.fromData(medicines)
            .sort((a, b) => {
                const aName = i18nTools.getName(this.localizedDataService.getItem(a.itemId));
                const bName = i18nTools.getName(this.localizedDataService.getItem(b.itemId));
                return aName > bName || !a.hq ? 1 : -1;
            });

        this.actions$.subscribe(actions => {
            this.dirty = false;
            this.pendingChanges.removePendingChange('rotation');
            this.serializedRotation = this.registry.serializeRotation(actions);
        });

        this.recipe$.subscribe(recipe => {
            this.recipeSync = recipe;
            this.hqIngredientsData = recipe.ingredients
                .filter(i => i.id > 20 && i.quality !== undefined)
                .map(ingredient => ({id: ingredient.id, amount: 0, max: ingredient.amount, quality: ingredient.quality}));
        });

        this.gearsets$ = this.userService.getUserData()
            .do(user => this.userData = user)
            .mergeMap(user => {
                if (user.anonymous) {
                    return Observable.of(user.gearSets)
                }
                return this.dataService.getGearsets(user.lodestoneId)
                    .map(gearsets => {
                        return gearsets.map(set => {
                            const customSet = user.gearSets.find(s => s.jobId === set.jobId);
                            if (customSet !== undefined) {
                                return customSet;
                            }
                            return set;
                        });
                    });
            });

        this.simulation$ = Observable.combineLatest(
            this.recipe$,
            this.actions$,
            this.crafterStats$,
            this.hqIngredients$,
            (recipe, actions, stats, hqIngredients) => new Simulation(recipe, actions, stats, hqIngredients)
        );

        this.result$ = Observable.combineLatest(this.snapshotStep$, this.simulation$, (step, simulation) => {
            simulation.reset();
            if (this.snapshotMode) {
                return simulation.run(true, step);
            }
            return simulation.run(true);
        });

        this.report$ = this.result$
            .debounceTime(250)
            .filter(res => res.success)
            .mergeMap(() => this.simulation$)
            .map(simulation => simulation.getReliabilityReport());
    }

    public showMinStats(simulation: Simulation): void {
        this.dialog.open(SimulationMinStatsPopupComponent, {data: simulation});
    }

    ngOnInit(): void {
        Observable.combineLatest(this.recipe$, this.gearsets$, (recipe, gearsets) => {
            let userSet = gearsets.find(set => set.jobId === recipe.job);
            if (userSet === undefined && this.selectedSet === undefined) {
                userSet = {
                    ilvl: 0,
                    control: 1500,
                    craftsmanship: 1350,
                    cp: 474,
                    jobId: 8,
                    level: 70,
                    specialist: false
                };
            }
            return userSet;
        }).subscribe(set => {
            this.selectedSet = set;
            this.applyStats(set, false);
        });
    }

    importRotation(): void {
        this.dialog.open(ImportRotationPopupComponent)
            .afterClosed()
            .filter(res => res !== undefined && res.length > 0 && res.indexOf('[') > -1)
            .map(importString => <string[]>JSON.parse(importString))
            .map(importArray => this.registry.importFromCraftOpt(importArray))
            .subscribe(rotation => {
                this.actions = rotation;
                this.markAsDirty();
            });
    }

    importMacro(): void {
        this.dialog.open(ImportMacroPopupComponent)
            .afterClosed()
            .filter(res => res !== undefined && res.length > 0 && res.indexOf('/ac') > -1)
            .map(macro => {
                const actionIds: number[] = [];
                for (const line of macro.split('\n')) {
                    let match = this.findActionsRegex.exec(line);
                    if (match !== null && match !== undefined) {
                        const skillName = match[2].replace(/"/g, '');
                        // Get translated skill
                        try {
                            actionIds
                                .push(this.localizedDataService.getCraftingActionIdByName(skillName, <Language>this.translate.currentLang));
                        } catch (ignored) {
                            // Ugly implementation but it's a specific case we don't want to refactor for.
                            try {
                                // If there's no skill match with the first regex, try the second one (for auto translated skills)
                                match = this.findActionsAutoTranslatedRegex.exec(line);
                                if (match !== null) {
                                    actionIds
                                        .push(this.localizedDataService.getCraftingActionIdByName(match[2],
                                            <Language>this.translate.currentLang));
                                }
                            } catch (ignoredAgain) {
                                break;
                            }
                        }
                    }
                }
                return actionIds;
            })
            .map(actionIds => this.registry.createFromIds(actionIds))
            .subscribe(rotation => {
                this.actions = rotation;
                this.markAsDirty();
            });
    }

    generateMacro(): void {
        this.dialog.open(MacroPopupComponent, {data: this.actions$.getValue()});
    }

    private markAsDirty(): void {
        this.pendingChanges.addPendingChange('rotation');
        this.dirty = true;
    }

    save(): void {
        if (!this.customMode) {
            this.onsave.emit({
                $key: this.rotationId,
                rotation: this.serializedRotation,
                recipe: this.recipeSync,
                consumables: {food: this._selectedFood, medicine: this._selectedMedicine}
            });
        } else {
            this.onsave.emit(<CustomCraftingRotation>{
                $key: this.rotationId,
                stats: this.selectedSet,
                rotation: this.serializedRotation,
                recipe: this.recipeSync,
                consumables: {food: this._selectedFood, medicine: this._selectedMedicine}
            });
        }
    }

    getStars(nb: number): string {
        return this.htmlTools.generateStars(nb);
    }

    getBuffIcon(effBuff: EffectiveBuff): string {
        return `./assets/icons/status/${Buff[effBuff.buff].toLowerCase()}.png`;
    }

    moveSkill(dragData: number | CraftingAction, targetIndex: number): void {
        const actions = this.actions$.getValue();
        // If the data is a number, use it as index
        if (+dragData === dragData) {
            actions.splice(targetIndex, 0, actions.splice(dragData, 1)[0]);
        } else if (dragData instanceof CraftingAction) {
            actions.splice(targetIndex, 0, dragData);
        }
        this.actions$.next(actions);
        this.markAsDirty();
    }

    getBonusValue(bonusType: BonusType, baseValue: number): number {
        let bonusFromFood = 0;
        let bonusFromMedicine = 0;
        if (this._selectedFood !== undefined) {
            const foodBonus = this._selectedFood.getBonus(bonusType);
            if (foodBonus !== undefined) {
                bonusFromFood = Math.ceil(baseValue * foodBonus.value);
                if (bonusFromFood > foodBonus.max) {
                    bonusFromFood = foodBonus.max;
                }
            }
        }
        if (this._selectedMedicine !== undefined) {
            const medicineBonus = this._selectedMedicine.getBonus(bonusType);
            if (medicineBonus !== undefined) {
                bonusFromMedicine = Math.ceil(baseValue * medicineBonus.value);
                if (bonusFromMedicine > medicineBonus.max) {
                    bonusFromMedicine = medicineBonus.max;
                }
            }
        }
        return bonusFromFood + bonusFromMedicine;
    }

    applyStats(set: GearSet, markDirty = true): void {
        this.crafterStats = new CrafterStats(
            set.jobId,
            set.craftsmanship + this.getBonusValue('Craftsmanship', set.craftsmanship),
            set.control + this.getBonusValue('Control', set.control),
            set.cp + this.getBonusValue('CP', set.cp),
            set.specialist,
            set.level);
        if (markDirty) {
            this.markAsDirty();
        }
    }

    saveSet(set: GearSet): void {
        // First of all, remove old gearset in userData for this job.
        this.userData.gearSets = this.userData.gearSets.filter(s => s.jobId !== set.jobId);
        // Then add this set to custom sets
        set.custom = true;
        this.userData.gearSets.push(set);
        this.userService.set(this.userData.$key, this.userData).subscribe();
    }

    resetSet(set: GearSet): void {
        this.userData.gearSets = this.userData.gearSets.filter(s => s.jobId !== set.jobId);
        this.userService.set(this.userData.$key, this.userData).subscribe();
    }

    addAction(action: CraftingAction): void {
        this.actions$.next(this.actions$.getValue().concat(action));
        this.markAsDirty();
    }

    removeAction(index: number): void {
        const rotation = this.actions$.getValue();
        rotation.splice(index, 1);
        this.actions$.next(rotation);
        this.markAsDirty();
    }

    clearRotation(): void {
        this.actions = [];
        this.markAsDirty();
    }

    getProgressActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.PROGRESSION);
    }

    getQualityActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.QUALITY);
    }

    getCpRecoveryActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.CP_RECOVERY);
    }

    getBuffActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.BUFF);
    }

    getSpecialtyActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.SPECIALTY);
    }

    getRepairActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.REPAIR);
    }

    getOtherActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.OTHER);
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }

    ngOnDestroy(): void {
        this.pendingChanges.removePendingChange('rotation');
    }
}
