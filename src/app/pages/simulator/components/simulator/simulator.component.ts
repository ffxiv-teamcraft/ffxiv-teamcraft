import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Craft} from '../../../../model/garland-tools/craft';
import {Simulation} from '../../simulation/simulation';
import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject} from 'rxjs';
import {CraftingAction} from '../../model/actions/crafting-action';
import {CrafterLevels, CrafterStats} from '../../model/crafter-stats';
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
import {freeCompanyActions} from '../../../../core/data/sources/free-company-actions';
import {BonusType} from '../../model/consumable-bonus';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';
import {CustomCraftingRotation} from '../../../../model/other/custom-crafting-rotation';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ImportRotationPopupComponent} from '../import-rotation-popup/import-rotation-popup.component';
import {MacroPopupComponent} from '../macro-popup/macro-popup.component';
import {PendingChangesService} from 'app/core/database/pending-changes/pending-changes.service';
import {SimulationMinStatsPopupComponent} from '../simulation-min-stats-popup/simulation-min-stats-popup.component';
import {ImportMacroPopupComponent} from '../import-macro-popup/import-macro-popup.component';
import {LocalizedDataService} from '../../../../core/data/localized-data.service';
import {TranslateService} from '@ngx-translate/core';
import {Language} from 'app/core/data/language';
import {ConsumablesService} from 'app/pages/simulator/model/consumables.service';
import {FreeCompanyAction} from 'app/pages/simulator/model/free-company-action';
import {FreeCompanyActionsService} from 'app/pages/simulator/model/free-company-actions.service';
import {I18nToolsService} from '../../../../core/tools/i18n-tools.service';
import {AppUser} from 'app/model/list/app-user';
import {debounceTime, filter, first, map, mergeMap, tap} from 'rxjs/operators';
import {CraftingJob} from '../../model/crafting-job.enum';
import {StepByStepReportPopupComponent} from '../step-by-step-report-popup/step-by-step-report-popup.component';
import {RotationNamePopupComponent} from '../rotation-name-popup/rotation-name-popup.component';
import {CraftingRotationService} from '../../../../core/database/crafting-rotation.service';
import {RecipeChoicePopupComponent} from '../recipe-choice-popup/recipe-choice-popup.component';
import {Router} from '@angular/router';

@Component({
    selector: 'app-simulator',
    templateUrl: './simulator.component.html',
    styleUrls: ['./simulator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent implements OnInit, OnDestroy {

    private defaultGearSets: GearSet[] = [
        {
            ilvl: 0,
            control: 1350,
            craftsmanship: 1500,
            cp: 474,
            jobId: 8,
            level: 70,
            specialist: false
        },
        {
            ilvl: 0,
            control: 1350,
            craftsmanship: 1500,
            cp: 474,
            jobId: 9,
            level: 70,
            specialist: false
        },
        {
            ilvl: 0,
            control: 1350,
            craftsmanship: 1500,
            cp: 474,
            jobId: 10,
            level: 70,
            specialist: false
        },
        {
            ilvl: 0,
            control: 1350,
            craftsmanship: 1500,
            cp: 474,
            jobId: 11,
            level: 70,
            specialist: false
        },
        {
            ilvl: 0,
            control: 1350,
            craftsmanship: 1500,
            cp: 474,
            jobId: 12,
            level: 70,
            specialist: false
        },
        {
            ilvl: 0,
            control: 1350,
            craftsmanship: 1500,
            cp: 474,
            jobId: 13,
            level: 70,
            specialist: false
        },
        {
            ilvl: 0,
            control: 1350,
            craftsmanship: 1500,
            cp: 474,
            jobId: 14,
            level: 70,
            specialist: false
        },
        {
            ilvl: 0,
            control: 1350,
            craftsmanship: 1500,
            cp: 474,
            jobId: 15,
            level: 70,
            specialist: false
        }
    ];

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

    public actionFailed = false;

    @Input()
    public set inputGearSet(set: GearSet) {
        if (set !== undefined) {
            this.selectedSet = set;
            // Custom mode assumes you have everything.
            this.applyStats(set, this.levels, false);
        }
    }

    public hqIngredientsData: { id: number, amount: number, max: number, quality: number }[] = [];

    public foods: Consumable[] = [];

    @Input()
    public levels: CrafterLevels;

    @Input()
    public set selectedFood(food: Consumable) {
        this._selectedFood = food;
        this.applyStats(this.selectedSet, this.levels, false);
    }

    public _selectedFood: Consumable;

    public medicines: Consumable[] = [];

    @Input()
    public set selectedMedicine(medicine: Consumable) {
        this._selectedMedicine = medicine;
        this.applyStats(this.selectedSet, this.levels, false);
    }

    public freeCompanyActions: FreeCompanyAction[] = [];

    public _selectedFreeCompanyActions: FreeCompanyAction[];

    @Input()
    public set selectedFreeCompanyActions(actions: FreeCompanyAction[]) {
        this._selectedFreeCompanyActions = actions;
        this.applyStats(this.selectedSet, this.levels, false);
    }

    @Input()
    authorId: string;

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

    public userData: AppUser;

    @Input()
    public rotation: CraftingRotation;

    availableRotations$: Observable<CraftingRotation[]>;

    private consumablesSortFn = (a, b) => {
        const aName = this.i18nTools.getName(this.localizedDataService.getItem(a.itemId));
        const bName = this.i18nTools.getName(this.localizedDataService.getItem(b.itemId));
        if (aName > bName) {
            return 1
        } else if (aName < bName) {
            return -1
        } else {
            // If they're both the same item, HQ first
            return a.hq ? -1 : 1;
        }
    };

    private freeCompanyActionsSortFn = (a, b) => {
        if (a.actionId > b.actionId) {
            return 1;
        } else {
            return -1;
        }
    };

    constructor(private registry: CraftingActionsRegistry, private media: ObservableMedia, private userService: UserService,
                private dataService: DataService, private htmlTools: HtmlToolsService, private dialog: MatDialog,
                private pendingChanges: PendingChangesService, private localizedDataService: LocalizedDataService,
                private translate: TranslateService, public consumablesService: ConsumablesService,
                public freeCompanyActionsService: FreeCompanyActionsService, private i18nTools: I18nToolsService,
                private snack: MatSnackBar, private cd: ChangeDetectorRef, public rotationsService: CraftingRotationService,
                private router: Router) {

        this.availableRotations$ = this.userService.getUserData()
            .pipe(
                mergeMap(user => {
                    return rotationsService.getUserRotations(user.$key);
                })
            );

        this.foods = consumablesService.fromData(foods)
            .sort(this.consumablesSortFn);
        this.medicines = consumablesService.fromData(medicines)
            .sort(this.consumablesSortFn);
        this.freeCompanyActions = freeCompanyActionsService.fromData(freeCompanyActions)
            .sort(this.freeCompanyActionsSortFn);

        this.actions$.subscribe(actions => {
            this.dirty = false;
            this.pendingChanges.removePendingChange('rotation');
            this.serializedRotation = this.registry.serializeRotation(actions);
        });

        this.recipe$.subscribe(recipe => {
            this.recipeSync = recipe;
            this.hqIngredientsData = (recipe.ingredients || [])
                .filter(i => i.id > 20 && i.quality !== undefined)
                .map(ingredient => ({id: ingredient.id, amount: 0, max: ingredient.amount, quality: ingredient.quality}));
        });

        this.gearsets$ = this.userService.getUserData()
            .pipe(
                tap(user => this.userData = user),
                mergeMap(user => {
                    if (user.anonymous) {
                        return of(this.populateMissingSets(user.gearSets || this.defaultGearSets));
                    }
                    return this.dataService.getGearsets(user.lodestoneId)
                        .pipe(
                            map(gearsets => {
                                const resultSets = gearsets.map(set => {
                                    const customSet = user.gearSets.find(s => s.jobId === set.jobId);
                                    if (customSet !== undefined) {
                                        return customSet;
                                    }
                                    return set;
                                });
                                // If there's some missing sets, populate them.
                                if (resultSets.length < 8) {
                                    return this.populateMissingSets(resultSets);
                                }
                                return resultSets.sort((a, b) => a.jobId - b.jobId);
                            }),
                            tap(sets => this.levels = <CrafterLevels>sets.map(set => set.level))
                        );
                }),
            );

        this.simulation$ = combineLatest(
            this.recipe$,
            this.actions$,
            this.crafterStats$,
            this.hqIngredients$,
            (recipe, actions, stats, hqIngredients) => new Simulation(recipe, actions, stats, hqIngredients)
        );

        this.result$ = combineLatest(this.snapshotStep$, this.simulation$, (step, simulation) => {
            simulation.reset();
            if (this.snapshotMode) {
                return simulation.run(true, step);
            }
            return simulation.run(true);
        }).pipe(
            tap(result => {
                this.actionFailed = result.steps.find(step => !step.success) !== undefined;
            })
        );

        this.report$ = this.result$
            .pipe(
                debounceTime(250),
                filter(res => res.success),
                mergeMap(() => this.simulation$),
                map(simulation => simulation.getReliabilityReport())
            );
    }

    useRotation(rotation: CraftingRotation): void {
        this.rotation = rotation;
        this.authorId = rotation.authorId;
        this.actions = this.registry.deserializeRotation(rotation.rotation);
        this.canSave = this.userData.$key === rotation.authorId;
    }

    private populateMissingSets(sets: GearSet[]): GearSet[] {
        // Get missing sets and concat to the input array, then return the result.
        return this.defaultGearSets.filter(row => sets.find(set => row.jobId === set.jobId) === undefined)
            .concat(sets);
    }

    public showMinStats(simulation: Simulation): void {
        this.dialog.open(SimulationMinStatsPopupComponent, {data: simulation});
    }

    ngOnInit(): void {
        combineLatest(this.recipe$, this.gearsets$, (recipe, gearsets) => {
            return {
                set: gearsets.find(set => set.jobId === recipe.job),
                levels: <CrafterLevels>gearsets.map(set => set.level)
            };
        }).subscribe(res => {
            this.selectedSet = res.set;
            this.applyStats(res.set, res.levels, false);
        });
    }

    importRotation(): void {
        this.dialog.open(ImportRotationPopupComponent)
            .afterClosed()
            .pipe(
                filter(res => res !== undefined && res.length > 0 && res.indexOf('[') > -1),
                map(importString => <string[]>JSON.parse(importString)),
                map(importArray => this.registry.importFromCraftOpt(importArray))
            ).subscribe(rotation => {
            this.actions = rotation;
            this.markAsDirty();
        });
    }

    importMacro(): void {
        this.dialog.open(ImportMacroPopupComponent)
            .afterClosed()
            .pipe(
                filter(res => res !== undefined && res.length > 0 && res.indexOf('/ac') > -1),
                map(macro => {
                    const actionIds: number[] = [];
                    for (const line of macro.split('\n')) {
                        let match = this.findActionsRegex.exec(line);
                        if (match !== null && match !== undefined) {
                            const skillName = match[2].replace(/"/g, '');
                            // Get translated skill
                            try {
                                actionIds
                                    .push(this.localizedDataService.getCraftingActionIdByName(skillName,
                                        <Language>this.translate.currentLang));
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
                }),
                map(actionIds => this.registry.createFromIds(actionIds))
            ).subscribe(rotation => {
            this.actions = rotation;
            this.markAsDirty();
        });
    }

    showStepByStepReport(result: SimulationResult): void {
        this.dialog.open(StepByStepReportPopupComponent, {data: result});
    }

    generateMacro(): void {
        this.crafterStats$
            .pipe(
                first()
            ).subscribe(crafterStats => {
            this.dialog.open(MacroPopupComponent, {
                data:
                    {
                        rotation: this.actions$.getValue(),
                        job: CraftingJob[crafterStats.jobId - 8]
                    }
            });
        });
    }

    private markAsDirty(): void {
        this.pendingChanges.addPendingChange('rotation');
        this.dirty = true;
    }

    save(asNew = false): void {
        let key = undefined;
        if (!asNew && this.rotation !== undefined) {
            key = this.rotation.$key;
        }
        if (!this.customMode) {
            this.onsave.emit({
                $key: key,
                name: this.rotation === undefined ? '' : this.rotation.name,
                rotation: this.serializedRotation,
                recipe: this.recipeSync,
                authorId: this.authorId,
                consumables: {food: this._selectedFood, medicine: this._selectedMedicine},
                freeCompanyActions: this._selectedFreeCompanyActions
            });
        } else {
            this.onsave.emit(<CustomCraftingRotation>{
                $key: key,
                name: this.rotation === undefined ? '' : this.rotation.name,
                stats: this.selectedSet,
                rotation: this.serializedRotation,
                recipe: this.recipeSync,
                authorId: this.authorId,
                consumables: {food: this._selectedFood, medicine: this._selectedMedicine},
                freeCompanyActions: this._selectedFreeCompanyActions
            });
        }
        if (asNew) {
            this.snack.open(this.translate.instant('SIMULATOR.Save_as_new_done'), null, {duration: 3000});
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
        let bonusFromFreeCompanyAction = 0;

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

        if (this._selectedFreeCompanyActions !== undefined) {
            bonusFromFreeCompanyAction = this.getFreeCompanyActionValue(bonusType);
        }

        return bonusFromFood + bonusFromMedicine + bonusFromFreeCompanyAction;
    }

    getFreeCompanyActionValue(bonusType: BonusType): number {
        let value = 0;
        let actions = this._selectedFreeCompanyActions || [];
        let action = actions.find(action => action.type === bonusType);

        if (action !== undefined) {
            value = action.value;
        }

        return value;
    }

    getFreeCompanyActions(type: string): FreeCompanyAction[] {
        let actions = this._selectedFreeCompanyActions;

        return this.freeCompanyActions.filter(action => action.type === <BonusType> type);
    }

    isFreeCompanyActionOptionDisabled(type: string, actionId: number): boolean {
        let actions = this._selectedFreeCompanyActions || [];

        return actions.find(action => action.type === type && action.actionId !== actionId) !== undefined;
    }

    compareFreeCompanyActionsFn(action1: FreeCompanyAction, action2: FreeCompanyAction): boolean {
        return action1 && action2 && action1.actionId === action2.actionId;
    }

    applyStats(set: GearSet, levels: CrafterLevels, markDirty = true): void {
        if (set === undefined) {
            return;
        }
        this.crafterStats = new CrafterStats(
            set.jobId,
            set.craftsmanship + this.getBonusValue('Craftsmanship', set.craftsmanship),
            set.control + this.getBonusValue('Control', set.control),
            set.cp + this.getBonusValue('CP', set.cp),
            set.specialist,
            set.level,
            (levels || [70, 70, 70, 70, 70, 70, 70, 70]));
        if (markDirty) {
            this.markAsDirty();
        }
    }

    changeRecipe(): void {
        this.dialog.open(RecipeChoicePopupComponent).afterClosed()
            .pipe(
                filter(res => res !== undefined && res !== null && res !== '')
            ).subscribe(result => {
            const path = ['simulator', result.itemId, result.recipeId];
            if (this.rotation.$key !== undefined) {
                path.push(this.rotation.$key);
            }
            this.router.navigate(path);
        });
    }

    editRotationName(rotation: CraftingRotation): void {
        this.dialog.open(RotationNamePopupComponent, {data: rotation})
            .afterClosed()
            .pipe(
                filter(res => res !== undefined && res.length > 0 && res !== this.rotation.getName())
            ).subscribe(name => {
            this.rotation.name = name;
            this.cd.detectChanges();
            this.markAsDirty();
        });
    }

    saveSet(set: GearSet): void {
        // First of all, remove old gearset in userData for this job.
        this.userData.gearSets = (this.userData.gearSets || []).filter(s => s.jobId !== set.jobId);
        // Then add this set to custom sets
        set.custom = true;
        this.userData.gearSets.push(set);
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
