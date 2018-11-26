import { Component, Input, OnDestroy } from '@angular/core';
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
import { distinctUntilChanged, filter, first, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
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
import { NzModalService } from 'ng-zorro-antd';
import { TextQuestionPopupComponent } from '../../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less']
})
export class SimulatorComponent implements OnDestroy {

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

  private _recipeId: string;

  public snapshotMode = false;

  public snapshotStep$: BehaviorSubject<number> = new BehaviorSubject<number>(Infinity);

  public tooltipsDisabled = false;

  public actionFailed = false;

  public result$: Observable<SimulationResult>;

  public actions$ = new BehaviorSubject<CraftingAction[]>([]);

  public crafterStats$: Observable<CrafterStats>;

  public stats$: Observable<CrafterStats>;

  private recipe$ = new ReplaySubject<Craft>();

  private simulation$: Observable<Simulation>;

  public report$: Observable<SimulationReliabilityReport>;

  public customStats$: ReplaySubject<CrafterStats> = new ReplaySubject<CrafterStats>();

  public rotation$ = combineLatest(this.rotationsFacade.selectedRotation$, this.actions$).pipe(
    map(([rotation, actions]) => {
      if (actions.length > 0) {
        rotation.rotation = this.registry.serializeRotation(actions);
      }
      return rotation;
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

  public bonuses$ = new BehaviorSubject<{ control: number, cp: number, craftsmanship: number }>({ control: 0, cp: 0, craftsmanship: 0 });

  private onDestroy$ = new Subject<void>();
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
              private route: ActivatedRoute, private dialog: NzModalService, private translate: TranslateService) {
    this.rotationsFacade.rotationCreated$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(createdKey => {
      this.router.navigate([createdKey], {
        relativeTo: this.route
      });
    });

    this.statsForm = this.fb.group({
      job: [8, Validators.required],
      craftsmanship: [0, Validators.required],
      control: [0, Validators.required],
      cp: [0, Validators.required],
      level: [0, Validators.required],
      specialist: [false]
    });

    this.foods = consumablesService.fromData(foods)
      .sort(this.consumablesSortFn);
    this.medicines = consumablesService.fromData(medicines)
      .sort(this.consumablesSortFn);
    this.freeCompanyActions = freeCompanyActionsService.fromData(freeCompanyActions)
      .sort(this.freeCompanyActionsSortFn);

    const job$ = merge(this.recipe$.pipe(map(r => r.job || 8)), this.customJob$);

    const statsFromRecipe$: Observable<CrafterStats> = combineLatest(this.recipe$, job$, this.authFacade.gearSets$).pipe(
      map(([recipe, job, sets]) => {
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
        });
      }),
      distinctUntilChanged((before, after) => {
        return JSON.stringify(before) === JSON.stringify(after);
      })
    );

    this.crafterStats$ = merge(statsFromRecipe$, this.customStats$);

    this.stats$ = combineLatest(this.crafterStats$, this.bonuses$).pipe(
      map(([stats, bonuses]) => {
        return new CrafterStats(
          stats.jobId,
          stats.craftsmanship + bonuses.craftsmanship,
          stats._control + bonuses.control,
          stats.cp + bonuses.cp,
          stats.specialist,
          stats.level,
          stats.levels);
      })
    );
    this.simulation$ = combineLatest(this.recipe$, this.actions$, this.stats$).pipe(
      map(([recipe, actions, stats]) => new Simulation(recipe, actions, stats)),
      shareReplay(1)
    );
    this.result$ = combineLatest(this.snapshotStep$, this.simulation$).pipe(
      map(([snapshotStep, sim]) => {
        sim.reset();
        if (this.snapshotMode) {
          return sim.run(true, snapshotStep);
        } else {
          return sim.run(true);
        }
      }),
      tap(result => this.actionFailed = result.steps.find(step => !step.success) !== undefined)
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
        }
      })
    );

    combineLatest(this.rotation$, this.crafterStats$).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(([rotation, stats]) => {
      if (rotation.rotation) {
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

  importFromCraftingOptimizer(): void {
    this.dialog.create({
      nzContent: TextQuestionPopupComponent,
      nzTitle: this.translate.instant('SIMULATOR.Import_from_crafting_optimizer'),
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => res !== undefined && res !== null && res.length > 0 && res[0] === '['),
        map(res => this.registry.importFromCraftOpt(JSON.parse(res))),
        first()
      ).subscribe(actions => this.actions$.next(actions));
  }

  saveRotation(rotation: CraftingRotation): void {
    combineLatest(this.stats$, this.actions$).pipe(
      first()
    ).subscribe(([stats, actions]) => {
      if (this.custom) {
        // custom-specific behavior goes here if we find any.
      } else {
        rotation.defaultItemId = this.item.id;
        rotation.defaultRecipeId = this._recipeId;
      }
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
      }
      if (this.selectedMedicine) {
        rotation.medicine = { id: this.selectedMedicine.itemId, hq: this.selectedMedicine.hq };
      }
      rotation.freeCompanyActions = <[number, number]>this.selectedFreeCompanyActions.map(action => action.actionId);
      this.rotationsFacade.updateRotation(rotation);
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
  }

  actionDrop(event: any): void {
    if (event.el.parentNode.classList.contains('actions-container')) {
      event.el.parentNode.removeChild(event.el);
    }
    this.addAction(event.value, event.dropIndex);
  }

  removeAction(index: number): void {
    const actions = this.actions$.value;
    actions.splice(index, 1);
    this.actions$.next([...actions]);
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
        bonusFromFood = Math.ceil(baseValue * foodBonus.value);
        if (bonusFromFood > foodBonus.max) {
          bonusFromFood = foodBonus.max;
        }
      }
    }
    if (this.selectedMedicine !== undefined && this.selectedMedicine !== null) {
      const medicineBonus = this.selectedMedicine.getBonus(bonusType);
      if (medicineBonus !== undefined) {
        bonusFromMedicine = Math.ceil(baseValue * medicineBonus.value);
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
    return this.freeCompanyActions.filter(action => action.type === <BonusType> type);
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

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
  }

}
