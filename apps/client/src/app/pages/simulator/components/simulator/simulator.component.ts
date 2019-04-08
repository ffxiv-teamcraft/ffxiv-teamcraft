import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CraftingAction } from '../../model/actions/crafting-action';
import { ActionType } from '../../model/actions/action-type';
import { CraftingActionsRegistry } from '../../model/crafting-actions-registry';
import { Simulation } from '../../simulation/simulation';
import { BehaviorSubject, combineLatest, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { CrafterLevels, CrafterStats } from '../../model/crafter-stats';
import { SimulationResult } from '../../simulation/simulation-result';
import { EffectiveBuff } from '../../model/effective-buff';
import { Buff } from '../../model/buff.enum';
import { Craft } from '../../../../model/garland-tools/craft';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  pairwise,
  shareReplay,
  startWith,
  takeUntil,
  tap
} from 'rxjs/operators';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { SimulationReliabilityReport } from '../../simulation/simulation-reliability-report';
import { AuthFacade } from '../../../../+state/auth.facade';
import { Item } from '../../../../model/garland-tools/item';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GearSet } from '../../model/gear-set';
import { ConsumablesService } from '../../model/consumables.service';
import { FreeCompanyActionsService } from '../../model/free-company-actions.service';
import { Consumable } from '../../model/consumable';
import { foods } from '../../../../core/data/sources/foods';
import { medicines } from '../../../../core/data/sources/medicines';
import { FreeCompanyAction } from '../../model/free-company-action';
import { freeCompanyActions } from '../../../../core/data/sources/free-company-actions';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../../core/data/localized-data.service';
import { BonusType } from '../../model/consumable-bonus';
import { DefaultConsumables } from '../../../../model/user/default-consumables';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TextQuestionPopupComponent } from '../../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../../../../core/data/language';
import { MacroPopupComponent } from '../macro-popup/macro-popup.component';
import { SimulationMinStatsPopupComponent } from '../simulation-min-stats-popup/simulation-min-stats-popup.component';
import { StepByStepReportComponent } from '../step-by-step-report/step-by-step-report.component';
import { CraftingJob } from '../../model/crafting-job.enum';
import { NameQuestionPopupComponent } from '../../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { LinkToolsService } from '../../../../core/tools/link-tools.service';
import { RotationPickerService } from '../../../../modules/rotations/rotation-picker.service';
import { RecipeChoicePopupComponent } from '../recipe-choice-popup/recipe-choice-popup.component';
import { fakeHQItems } from '../../../../core/data/sources/fake-hq-items';
import { RotationTip } from '../../rotation-tips/rotation-tip';
import { RotationTipsService } from '../../rotation-tips/rotation-tips.service';
import { RotationTipsPopupComponent } from '../rotation-tips-popup/rotation-tips-popup.component';
import { DirtyScope } from '../../../../core/dirty/dirty-scope';
import { DirtyFacade } from '../../../../core/dirty/+state/dirty.facade';
import { CommunityRotationPopupComponent } from '../community-rotation-popup/community-rotation-popup.component';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less']
})
export class SimulatorComponent implements OnInit, OnDestroy {

  public dirtyScope = DirtyScope;

  @Input()
  public custom = false;

  @Input()
  public set recipe(recipe: Craft) {
    this.recipe$.next(recipe);
    if (recipe.id) {
      this._recipeId = recipe.id;
    }
  }

  @Input()
  public item: Item;

  @Input()
  public thresholds: number[] = [];

  public safeMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(localStorage.getItem('simulator:safe-mode') === 'true');

  private _recipeId: string;

  public snapshotMode = false;

  public snapshotStep$: BehaviorSubject<number> = new BehaviorSubject<number>(Infinity);

  public tooltipsDisabled = false;

  public actionFailed = false;

  public result$: Observable<SimulationResult>;

  public actions$ = new BehaviorSubject<CraftingAction[]>([]);

  private draggedAction$: CraftingAction;

  private draggedIndex$: number;

  public crafterStats$: Observable<CrafterStats>;

  public stats$: Observable<CrafterStats>;

  public loggedIn$ = this.authFacade.loggedIn$;

  private recipe$ = new ReplaySubject<Craft>();

  public simulation$: Observable<Simulation>;

  public report$: Observable<SimulationReliabilityReport>;

  public tips$: Observable<RotationTip[]>;

  public customStats$: ReplaySubject<CrafterStats> = new ReplaySubject<CrafterStats>();

  public rotation$ = this.rotationsFacade.selectedRotation$.pipe(
    tap(rotation => {
      if (rotation.$key === undefined && rotation.rotation.length > 0) {
        this.dirty = true;
        this.dirtyFacade.addEntry('simulator', DirtyScope.PAGE);
      }
    })
  );

  // Customization forms
  public statsForm: FormGroup;
  // Cache field for levels to be passed to the form validation.
  private availableLevels: CrafterLevels;
  //
  public customJob$: ReplaySubject<number> = new ReplaySubject<number>();

  // Consumables
  public foods: Consumable[] = [];
  public medicines: Consumable[] = [];
  public freeCompanyActions: FreeCompanyAction[] = [];

  public selectedFood: Consumable;
  public selectedMedicine: Consumable;
  public selectedFreeCompanyActions: FreeCompanyAction[] = [];

  public bonuses$ = new BehaviorSubject<{ control: number, cp: number, craftsmanship: number }>({
    control: 0,
    cp: 0,
    craftsmanship: 0
  });

  private onDestroy$ = new Subject<void>();

  private job: CraftingJob;

  public dirty = false;

  // HQ ingredients
  private hqIngredients$: BehaviorSubject<{ id: number, amount: number }[]> =
    new BehaviorSubject<{ id: number, amount: number }[]>([]);

  @Input()
  public set hqIngredients(ingredients: { id: number, amount: number, quality: number }[]) {
    this.hqIngredients$.next(ingredients);
    this.startingQuality$.next(ingredients.reduce((total, ingredient) => {
      return total + ingredient.amount * ingredient.quality;
    }, 0));
  }

  public hqIngredientsData$: Observable<{ id: number, amount: number, max: number, quality: number }[]>;

  public startingQuality$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  // Regex stuff for macro import
  private findActionsRegex: RegExp =
    new RegExp(/\/(ac|action)[\s]+(([\w]+)|"([^"]+)")?.*/, 'i');

  private findActionsAutoTranslatedRegex: RegExp =
    new RegExp(/\/(ac|action)[\s]+([^<]+)?.*/, 'i');

  public permissionLevel$ = combineLatest(this.rotation$, this.authFacade.userId$).pipe(
    map(([rotation, userId]) => {
      return rotation.authorId === undefined ? 40 : rotation.getPermissionLevel(userId);
    })
  );

  private consumablesSortFn = (a, b) => {
    const aName = this.i18nTools.getName(this.localizedDataService.getItem(a.itemId));
    const bName = this.i18nTools.getName(this.localizedDataService.getItem(b.itemId));
    if (aName > bName) {
      return 1;
    } else if (aName < bName) {
      return -1;
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

  constructor(public registry: CraftingActionsRegistry, private htmlTools: HtmlToolsService,
              private authFacade: AuthFacade, private fb: FormBuilder, public consumablesService: ConsumablesService,
              public freeCompanyActionsService: FreeCompanyActionsService, private i18nTools: I18nToolsService,
              private localizedDataService: LocalizedDataService, private rotationsFacade: RotationsFacade, private router: Router,
              private route: ActivatedRoute, private dialog: NzModalService, private translate: TranslateService,
              private message: NzMessageService, private linkTools: LinkToolsService, private rotationPicker: RotationPickerService,
              private rotationTipsService: RotationTipsService, private dirtyFacade: DirtyFacade, private cd: ChangeDetectorRef) {
    this.rotationsFacade.rotationCreated$.pipe(
      takeUntil(this.onDestroy$),
      filter(key => key !== undefined)
    ).subscribe(createdKey => {
      const commands = ['simulator'];
      if (this.custom) {
        commands.push('custom', createdKey);
      } else {
        commands.push(this.item.id.toString(), this._recipeId, createdKey);
      }
      this.router.navigate(commands);
    });

    this.statsForm = this.fb.group({
      job: [8, Validators.required],
      craftsmanship: [0, Validators.required],
      control: [0, Validators.required],
      cp: [180, Validators.required],
      level: [0, Validators.required],
      specialist: [false]
    });

    this.foods = consumablesService.fromData(foods)
      .sort(this.consumablesSortFn);
    this.medicines = consumablesService.fromData(medicines)
      .sort(this.consumablesSortFn);
    this.freeCompanyActions = freeCompanyActionsService.fromData(freeCompanyActions)
      .sort(this.freeCompanyActionsSortFn);

    const job$ = merge(this.recipe$.pipe(map(r => r.job || 8)), this.customJob$).pipe(tap(job => this.job = job));

    const statsFromRecipe$: Observable<CrafterStats> = combineLatest(this.recipe$, job$, this.authFacade.gearSets$).pipe(
      map(([, job, sets]) => {
        const set = sets.find(s => s.jobId === job);
        return new CrafterStats(set.jobId, set.craftsmanship, set.control, set.cp, set.specialist, set.level, <CrafterLevels>sets.map(s => s.level));
      }),
      tap(stats => {
        this.availableLevels = stats.levels;
        this.statsForm.reset({
          job: stats.jobId,
          craftsmanship: stats.craftsmanship,
          control: stats._control,
          cp: stats.cp,
          level: stats.level,
          specialist: stats.specialist
        }, { emitEvent: false });
      }),
      distinctUntilChanged((before, after) => {
        return JSON.stringify(before) === JSON.stringify(after);
      })
    );

    this.hqIngredientsData$ = this.recipe$.pipe(
      map(recipe => {
        return (recipe.ingredients || [])
          .filter(i => i.id > 20 && i.quality !== undefined && !fakeHQItems.some(id => i.id === id))
          .map(ingredient => ({ id: +ingredient.id, amount: 0, max: ingredient.amount, quality: ingredient.quality }));
      })
    );

    this.crafterStats$ = merge(statsFromRecipe$, this.customStats$).pipe(shareReplay(1));

    this.stats$ = combineLatest(this.crafterStats$, this.bonuses$, this.loggedIn$).pipe(
      map(([stats, bonuses, loggedIn]) => {
        return new CrafterStats(
          stats.jobId,
          stats.craftsmanship + bonuses.craftsmanship,
          stats._control + bonuses.control,
          stats.cp + bonuses.cp,
          stats.specialist,
          stats.level,
          loggedIn ? stats.levels : [70, 70, 70, 70, 70, 70, 70, 70]);
      })
    );
    this.simulation$ = combineLatest(this.recipe$, this.actions$, this.stats$, this.hqIngredients$).pipe(
      map(([recipe, actions, stats, hqIngredients]) => {
        return new Simulation(recipe, actions, stats, hqIngredients);
      }),
      shareReplay(1)
    );

    combineLatest(this.rotation$, this.crafterStats$).pipe(
      startWith([]),
      pairwise(),
      map(([before, after]) => {
        return [...after, before[0] ? before[0].$key !== after[0].$key : true];
      }),
      takeUntil(this.onDestroy$)
    ).subscribe(([rotation, stats, rotationChanged]: [CraftingRotation, CrafterStats, boolean]) => {
      if (this.actions$.value.length === 0 || rotationChanged) {
        this.actions$.next(this.registry.deserializeRotation(rotation.rotation));
      }
      if (rotation.food && this.selectedFood === undefined) {
        this.selectedFood = this.foods.find(f => rotation.food && f.itemId === rotation.food.id && f.hq === rotation.food.hq);
      }
      if (rotation.medicine && this.selectedMedicine === undefined) {
        this.selectedMedicine = this.medicines.find(m => rotation.medicine && m.itemId === rotation.medicine.id && m.hq === rotation.medicine.hq);
      }
      if (rotation.freeCompanyActions && this.selectedFreeCompanyActions.length === 0) {
        this.selectedFreeCompanyActions = this.freeCompanyActions.filter(action => rotation.freeCompanyActions.indexOf(action.actionId) > -1);
      }
      this.applyConsumables(stats);
    });
  }

  disableEvent(event: any): void {
    event.el.parentNode.removeChild(event.el);
  }

  changeRotation(): void {
    this.rotationPicker.openInSimulator(this.item ? this.item.id : undefined, this._recipeId, true, this.custom);
  }

  getCraftOptExportString(): string {
    return this.registry.exportToCraftOpt(this.registry.serializeRotation(this.actions$.value));
  }

  changeRecipe(rotation: CraftingRotation): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: RecipeChoicePopupComponent,
      nzComponentParams: {
        rotationId: rotation.$key,
        warning: this.dirty ? 'SIMULATOR.Changing_recipe_save_warning' : null
      },
      nzTitle: this.translate.instant('Pick_a_recipe')
    });
  }

  showRotationTips(tips: RotationTip[], result: SimulationResult): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: RotationTipsPopupComponent,
      nzComponentParams: {
        tips: tips,
        result: result
      },
      nzTitle: this.translate.instant('SIMULATOR.Rotation_tips')
    });
  }

  renameRotation(rotation: CraftingRotation): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: rotation.getName() },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        rotation.name = name;
        return rotation;
      })
    ).subscribe(r => {
      this.saveRotation(r);
      this.dirty = false;
      this.dirtyFacade.removeEntry('simulator', DirtyScope.PAGE);
    });
  }

  success(translationKey: string): void {
    this.message.success(this.translate.instant(translationKey));
  }

  importFromCraftingOptimizer(): void {
    this.dialog.create({
      nzContent: TextQuestionPopupComponent,
      nzTitle: this.translate.instant('SIMULATOR.Import_from_crafting_optimizer'),
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => res !== undefined && res !== null && res.length > 0 && res.indexOf('[') > -1),
        map(res => this.registry.importFromCraftOpt(JSON.parse(res))),
        first()
      ).subscribe(actions => this.actions$.next(actions));
  }

  openMacroPopup(simulation: Simulation): void {
    this.dialog.create({
      nzContent: MacroPopupComponent,
      nzComponentParams: {
        rotation: this.actions$.value,
        job: this.job,
        simulation: simulation.clone(),
        food: this.selectedFood,
        medicine: this.selectedMedicine,
        freeCompanyActions: this.selectedFreeCompanyActions
      },
      nzTitle: this.translate.instant('SIMULATOR.Generate_ingame_macro'),
      nzFooter: null
    });
  }

  openMinStatsPopup(simulation: Simulation): void {
    this.dialog.create({
      nzContent: SimulationMinStatsPopupComponent,
      nzComponentParams: {
        simulation: simulation.clone()
      },
      nzTitle: this.translate.instant('SIMULATOR.Min_stats'),
      nzFooter: null
    });
  }

  openStepByStepReportPopup(result: SimulationResult): void {
    this.dialog.create({
      nzContent: StepByStepReportComponent,
      nzComponentParams: {
        steps: result.steps
      },
      nzTitle: this.translate.instant('SIMULATOR.Step_by_step_report'),
      nzFooter: null
    });
  }

  getLink(rotation: CraftingRotation): string {
    if (rotation.custom) {
      return this.linkTools.getLink(`/simulator/custom/${rotation.$key}`);
    } else {
      return this.linkTools.getLink(`/simulator/${rotation.defaultItemId}/${rotation.defaultRecipeId}/${rotation.$key}`);
    }
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('SIMULATOR.Share_link_copied'));
  }

  importFromXIVMacro(): void {
    this.dialog.create({
      nzContent: TextQuestionPopupComponent,
      nzTitle: this.translate.instant('SIMULATOR.Import_macro'),
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => res !== undefined && res !== null && res.length > 0 && res.indexOf('/ac') > -1),
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
        map(actionIds => this.registry.createFromIds(actionIds)),
        first()
      ).subscribe(actions => this.actions$.next(actions));
  }

  saveRotation(rotation: CraftingRotation): void {
    combineLatest(this.stats$, this.actions$, this.recipe$).pipe(
      first()
    ).subscribe(([stats, actions, recipe]) => {
      if (this.custom) {
        // custom-specific behavior goes here if we find any.
      } else {
        rotation.defaultItemId = this.item.id;
        rotation.defaultRecipeId = this._recipeId;
      }
      rotation.recipe = recipe;
      rotation.stats = {
        jobId: stats.jobId,
        specialist: stats.specialist,
        craftsmanship: stats.craftsmanship,
        cp: stats.cp,
        control: stats._control,
        level: stats.level
      };
      rotation.rotation = this.registry.serializeRotation(actions);
      rotation.custom = this.custom;
      if (this.selectedFood) {
        rotation.food = { id: this.selectedFood.itemId, hq: this.selectedFood.hq };
      } else {
        delete rotation.food;
      }
      if (this.selectedMedicine) {
        rotation.medicine = { id: this.selectedMedicine.itemId, hq: this.selectedMedicine.hq };
      } else {
        delete rotation.medicine;
      }
      rotation.freeCompanyActions = <[number, number]>this.selectedFreeCompanyActions.map(action => action.actionId);
      this.rotationsFacade.updateRotation(rotation);
      this.dirty = false;
      this.dirtyFacade.removeEntry('simulator', DirtyScope.PAGE);
    });
  }

  saveRotationAsNew(rotation: CraftingRotation): void {
    delete rotation.$key;
    this.saveRotation(rotation);
  }

  addAction(action: CraftingAction, index?: number) {
    if (index === undefined) {
      this.actions$.next([...this.actions$.value, action]);
    } else {
      const actions = this.actions$.value;
      actions.splice(index, 0, action);
      this.actions$.next([...actions]);
    }
    this.dirty = true;
    this.dirtyFacade.addEntry('simulator', DirtyScope.PAGE);
  }

  actionDrag(index: number): void {
    this.draggedAction$ = this.actions$.value[index];
    this.draggedIndex$ = index;
    this.removeAction(index);
  }

  actionDrop(event: any): void {
    if (event.el.parentNode.classList.contains('actions-container')) {
      event.el.parentNode.removeChild(event.el);
    }
    this.addAction(event.value, event.dropIndex);
    this.draggedAction$ = null;
  }

  dragCancel(event: any): void {
    if (event.el.parentNode.classList.contains('actions-container')) {
      event.el.parentNode.removeChild(event.el);
    }
    this.addAction(this.draggedAction$, this.draggedIndex$);
    this.draggedAction$ = null;
  }

  removeAction(index: number): void {
    const actions = this.actions$.value;
    actions.splice(index, 1);
    this.actions$.next([...actions]);
    this.dirty = true;
    this.dirtyFacade.addEntry('simulator', DirtyScope.PAGE);
  }

  applyStats(): void {
    const rawForm = this.statsForm.getRawValue();
    const stats = new CrafterStats(
      rawForm.job,
      rawForm.craftsmanship,
      rawForm.control,
      rawForm.cp,
      rawForm.specialist,
      rawForm.level,
      this.availableLevels
    );
    this.customStats$.next(stats);
  }

  saveSet(): void {
    const rawForm = this.statsForm.getRawValue();
    const set: GearSet = {
      jobId: rawForm.job,
      level: rawForm.level,
      control: rawForm.control,
      craftsmanship: rawForm.craftsmanship,
      cp: rawForm.cp,
      specialist: rawForm.specialist
    };
    this.authFacade.saveSet(set);
  }

  saveDefaultConsumables(): void {
    const consumables: DefaultConsumables = {
      food: {
        id: (this.selectedFood || <any>{}).itemId,
        hq: (this.selectedFood || <any>{}).hq
      },
      medicine: {
        id: (this.selectedMedicine || <any>{}).itemId,
        hq: (this.selectedMedicine || <any>{}).hq
      },
      fcBuffs: <[number, number]>(this.selectedFreeCompanyActions || []).map(action => action.actionId)
    };
    this.authFacade.saveDefaultConsumables(consumables);
  }

  applyConsumables(crafterStats: CrafterStats): void {
    this.bonuses$.next({
      craftsmanship: this.getBonusValue('Craftsmanship', crafterStats.craftsmanship),
      control: this.getBonusValue('Control', crafterStats._control),
      cp: this.getBonusValue('CP', crafterStats.cp)
    });
  }

  getBonusValue(bonusType: BonusType, baseValue: number): number {
    let bonusFromFood = 0;
    let bonusFromMedicine = 0;
    let bonusFromFreeCompanyAction = 0;

    if (this.selectedFood !== undefined && this.selectedFood !== null) {
      const foodBonus = this.selectedFood.getBonus(bonusType);
      if (foodBonus !== undefined) {
        bonusFromFood = Math.floor(baseValue * foodBonus.value);
        if (bonusFromFood > foodBonus.max) {
          bonusFromFood = foodBonus.max;
        }
      }
    }
    if (this.selectedMedicine !== undefined && this.selectedMedicine !== null) {
      const medicineBonus = this.selectedMedicine.getBonus(bonusType);
      if (medicineBonus !== undefined) {
        bonusFromMedicine = Math.floor(baseValue * medicineBonus.value);
        if (bonusFromMedicine > medicineBonus.max) {
          bonusFromMedicine = medicineBonus.max;
        }
      }
    }

    if (this.selectedFreeCompanyActions !== undefined && this.selectedFreeCompanyActions !== null) {
      bonusFromFreeCompanyAction = this.getFreeCompanyActionValue(bonusType);
    }

    return bonusFromFood + bonusFromMedicine + bonusFromFreeCompanyAction;
  }

  getFreeCompanyActionValue(bonusType: BonusType): number {
    let value = 0;
    const actions = this.selectedFreeCompanyActions || [];
    const action = actions.find(a => a.type === bonusType);

    if (action !== undefined) {
      value = action.value;
    }

    return value;
  }

  getFreeCompanyActions(type: string): FreeCompanyAction[] {
    return this.freeCompanyActions.filter(action => action.type === <BonusType>type);
  }

  isFreeCompanyActionOptionDisabled(type: string, actionId: number): boolean {
    const actions = this.selectedFreeCompanyActions || [];

    return actions.find(action => action.type === type && action.actionId !== actionId) !== undefined;
  }

  barFormat(current: number, max: number): () => string {
    return () => `${current}/${max}`;
  }

  barPercent(current: number, max: number): number {
    return Math.min(100 * current / max, 100);
  }


  getStars(stars: number): string {
    return this.htmlTools.generateStars(stars);
  }

  getBuffIcon(effBuff: EffectiveBuff): string {
    return `./assets/icons/status/${Buff[effBuff.buff].toLowerCase()}.png`;
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

  saveSafeMode(value: boolean): void {
    localStorage.setItem('simulator:safe-mode', value.toString());
  }

  toggleSpecialist(): void {
    const stats = this.statsForm.getRawValue();
    if (stats.specialist) {
      stats.craftsmanship += 20;
      stats.control += 20;
    } else if (stats.craftsmanship > 0 && stats.control > 0) {
      stats.craftsmanship -= 20;
      stats.control -= 20;
    }
    this.statsForm.patchValue(stats, { emitEvent: false });
  }

  openCommunityRotationConfiguration(rotation: CraftingRotation, simulation: Simulation, stats: CrafterStats): void {
    this.cd.detach();
    this.dialog.create({
      nzContent: CommunityRotationPopupComponent,
      nzComponentParams: {
        rotation: rotation,
        simulation: simulation.clone(),
        bonuses: {
          craftsmanship: this.getBonusValue('Craftsmanship', stats.craftsmanship),
          control: this.getBonusValue('Control', stats._control),
          cp: this.getBonusValue('CP', stats.cp)
        }
      },
      nzTitle: this.translate.instant('SIMULATOR.COMMUNITY_ROTATIONS.Configuration_popup'),
      nzFooter: null
    }).afterClose.subscribe(() => {
      this.cd.reattach();
      this.cd.markForCheck();
      this.saveRotation(rotation);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
  }

  ngOnInit(): void {
    this.result$ = combineLatest(this.snapshotStep$, this.simulation$, this.safeMode$).pipe(
      map(([snapshotStep, sim, safeMode]) => {
        sim.reset();
        if (this.snapshotMode) {
          return sim.run(true, snapshotStep, safeMode);
        } else {
          return sim.run(true, Infinity, safeMode);
        }
      }),
      tap(result => this.actionFailed = result.steps.find(step => !step.success) !== undefined),
      shareReplay(1)
    );

    this.report$ = combineLatest(this.simulation$, this.result$).pipe(
      map(([simulation, result]) => {
        if (!result.success) {
          return {
            averageHQPercent: 0,
            medianHQPercent: 0,
            rawData: [],
            successPercent: 0
          };
        } else {
          return simulation.clone().getReliabilityReport();
        }
      })
    );

    this.tips$ = this.result$.pipe(
      map((result) => {
        return this.rotationTipsService.getTips(result);
      })
    );
  }

}
