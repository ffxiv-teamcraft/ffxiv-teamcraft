import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable, of, ReplaySubject, Subject, take } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  first,
  map,
  pairwise,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { AuthFacade } from '../../../../+state/auth.facade';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsumablesService } from '../../model/consumables.service';
import { FreeCompanyActionsService } from '../../model/free-company-actions.service';
import { Consumable } from '../../model/consumable';
import { FreeCompanyAction } from '../../model/free-company-action';
import { freeCompanyActions } from '../../../../core/data/sources/free-company-actions';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { BonusType } from '../../model/consumable-bonus';
import { DefaultConsumables } from '../../../../model/user/default-consumables';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TextQuestionPopupComponent } from '../../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Language } from '../../../../core/data/language';
import { MacroPopupComponent } from '../macro-popup/macro-popup.component';
import { SimulationMinStatsPopupComponent } from '../simulation-min-stats-popup/simulation-min-stats-popup.component';
import { StepByStepReportComponent } from '../step-by-step-report/step-by-step-report.component';
import { NameQuestionPopupComponent } from '../../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { LinkToolsService } from '../../../../core/tools/link-tools.service';
import { RotationPickerService } from '../../../../modules/rotations/rotation-picker.service';
import { RecipeChoicePopupComponent } from '../recipe-choice-popup/recipe-choice-popup.component';
import { RotationTip } from '../../rotation-tips/rotation-tip';
import { RotationTipsService } from '../../rotation-tips/rotation-tips.service';
import { RotationTipsPopupComponent } from '../rotation-tips-popup/rotation-tips-popup.component';
import { DirtyScope } from '../../../../core/dirty/dirty-scope';
import { DirtyFacade } from '../../../../core/dirty/+state/dirty.facade';
import { CommunityRotationPopupComponent } from '../community-rotation-popup/community-rotation-popup.component';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { IpcService } from '../../../../core/electron/ipc.service';
import { PlatformService } from '../../../../core/tools/platform.service';
import { SimulationSharePopupComponent } from '../simulation-share-popup/simulation-share-popup.component';
import {
  ActionResult,
  CrafterLevels,
  CrafterStats,
  CraftingAction,
  CraftingJob,
  EffectiveBuff,
  GearSet,
  Simulation,
  SimulationReliabilityReport,
  SimulationResult,
  SimulationService,
  StepState
} from '../../../../core/simulation/simulation.service';
import { CdkDragDrop, CdkDragEnter, CdkDropList, DragRef, moveItemInArray, CdkDropListGroup, CdkDrag } from '@angular/cdk/drag-drop';
import { RouteConsumables } from '../../model/route-consumables';
import { CommunityRotationFinderPopupComponent } from '../community-rotation-finder-popup/community-rotation-finder-popup.component';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../../core/rxjs/safe-combine-latest';
import { FinalAppraisal } from '@ffxiv-teamcraft/simulator';
import { observeInput } from '../../../../core/rxjs/observe-input';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';
import { LocalStorageBehaviorSubject } from '../../../../core/rxjs/local-storage-behavior-subject';
import { PermissionsController } from '../../../../core/database/permissions-controller';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { LazyRecipe } from '@ffxiv-teamcraft/data/model/lazy-recipe';
import { I18nRowPipe } from '../../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { JobUnicodePipe } from '../../../../pipes/pipes/job-unicode.pipe';
import { IfMobilePipe } from '../../../../pipes/pipes/if-mobile.pipe';
import { ActionNamePipe } from '../../../../pipes/pipes/action-name.pipe';
import { FloorPipe } from '../../../../pipes/pipes/floor.pipe';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { FullpageMessageComponent } from '../../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { ActionComponent } from '../action/action.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NzCardModule } from 'ng-zorro-antd/card';
import { SimulationResultComponent } from '../simulation-result/simulation-result.component';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FavoriteButtonComponent } from '../../../../modules/favorites/favorite-button/favorite-button.component';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { ClipboardDirective } from '../../../../core/clipboard.directive';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TutorialStepDirective } from '../../../../core/tutorial/tutorial-step.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-simulator',
    templateUrl: './simulator.component.html',
    styleUrls: ['./simulator.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, NzButtonModule, NzWaveModule, NzToolTipModule, TutorialStepDirective, NzIconModule, NzPopconfirmModule, ClipboardDirective, NzBadgeModule, FavoriteButtonComponent, NzTagModule, NzSwitchModule, FormsModule, NzCollapseModule, NzSelectModule, NgFor, NzAlertModule, ReactiveFormsModule, NzGridModule, NzFormModule, NzInputModule, NzInputNumberModule, NzCheckboxModule, NzListModule, ItemIconComponent, SimulationResultComponent, NzCardModule, CdkDropListGroup, NgStyle, ExtendedModule, CdkDropList, ActionComponent, CdkDrag, NgSwitch, NgSwitchCase, NgSwitchDefault, FullpageMessageComponent, AsyncPipe, TranslateModule, ItemNamePipe, FloorPipe, ActionNamePipe, IfMobilePipe, JobUnicodePipe, I18nPipe, I18nRowPipe]
})
export class SimulatorComponent implements OnInit, AfterViewInit, OnDestroy {

  public dirtyScope = DirtyScope;

  @ViewChildren('rotationContainer')
  public rotationContainer: QueryList<ElementRef>;

  @ViewChildren('stepTemplate', { read: CdkDropList })
  public stepTemplate: QueryList<CdkDropList>;

  @ViewChildren('placeholder', { read: CdkDropList })
  public placeholder: QueryList<CdkDropList>;

  @Input()
  public custom = false;

  @Input()
  public itemId: number;

  @Input()
  public thresholds: number[] = [];

  @Input()
  public routeStats: { craftsmanship: number, control: number, cp: number, spec: boolean, level: number, splendorous: boolean };

  @Input()
  public routeConsumables: RouteConsumables;

  public safeMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(localStorage.getItem('simulator:safe-mode') === 'true');

  public snapshotMode = false;

  public snapshotStep$: BehaviorSubject<number> = new BehaviorSubject<number>(Infinity);

  public tooltipsDisabled = false;

  public actionFailed = false;

  public result$: Observable<SimulationResult>;

  public actions$ = new BehaviorSubject<CraftingAction[]>([]);

  public crafterStats$: Observable<CrafterStats>;

  public stats$: Observable<CrafterStats>;

  public loggedIn$ = this.authFacade.loggedIn$;

  public simulation$: Observable<Simulation>;

  public report$: Observable<SimulationReliabilityReport>;

  public tips$: Observable<RotationTip[]>;

  public showFullButtons$ = new LocalStorageBehaviorSubject('simulator:full-buttons', false);

  public customStats$: ReplaySubject<CrafterStats> = new ReplaySubject<CrafterStats>();

  // Customization forms
  public statsForm: UntypedFormGroup;

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

  public dirty = false;

  private unsavedChanges$ = new Subject<CraftingRotation>();

  public rotation$ = merge(
    this.rotationsFacade.selectedRotation$,
    this.unsavedChanges$
  ).pipe(
    distinctUntilChanged(),
    tap(rotation => {
      if (rotation.$key === undefined && rotation.rotation.length > 0) {
        this.markAsDirty();
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public savedSet = true;

  public forcedStartingQuality$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public hqIngredientsData$: Observable<{ id: number, amount: number, max: number, quality: number }[]>;

  public startingQuality$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public stepStates$: BehaviorSubject<{ [index: number]: StepState }> = new BehaviorSubject<{ [index: number]: StepState }>({});

  public qualityPer100$: Observable<number>;

  public progressPer100$: Observable<number>;

  public permissionLevel$ = combineLatest([this.rotation$, this.authFacade.userId$]).pipe(
    map(([rotation, userId]) => {
      return rotation.authorId === undefined ? 40 : PermissionsController.getPermissionLevel(rotation, userId);
    })
  );

  public dirtyConsumables = false;

  private _recipeId: string;

  private recipe$ = new ReplaySubject<LazyRecipe>();

  // Cache field for levels to be passed to the form validation.
  private availableLevels: CrafterLevels;

  private onDestroy$ = new Subject<void>();

  private job: CraftingJob;

  private formChangesSubscription: any;

  // HQ ingredients
  private hqIngredients$: BehaviorSubject<{ id: number, amount: number }[]> =
    new BehaviorSubject<{ id: number, amount: number }[]>([]);

  private job$: Observable<any>;

  private fails$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  private findActionsRegex =
    new RegExp(/\/(ac|action|aaction|gaction|generalaction|statusoff)[\s]+((\w|[éàèç]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B)+|"[^"]+")?.*/, 'i');

  private findActionsAutoTranslatedRegex =
    new RegExp(/\/(ac|action|aaction|gaction|generalaction|statusoff)[\s]+([^<]+)?.*/, 'i');

  public statsTooLow$: Observable<boolean>;

  public levelTooLow$: Observable<boolean>;

  public connectedDropLists: string[] = [];

  private target: CdkDropList = null;

  private targetIndex: number;

  private source: CdkDropList = null;

  private sourceIndex: number;

  private dragRef: DragRef = null;

  public boxWidth = 50;

  public boxHeight = 40;

  constructor(private htmlTools: HtmlToolsService, public settings: SettingsService,
              private authFacade: AuthFacade, private fb: UntypedFormBuilder, public consumablesService: ConsumablesService,
              public freeCompanyActionsService: FreeCompanyActionsService, private i18n: I18nToolsService,
              private rotationsFacade: RotationsFacade, private router: Router,
              private route: ActivatedRoute, private dialog: NzModalService, public translate: TranslateService,
              private message: NzMessageService, private linkTools: LinkToolsService, private rotationPicker: RotationPickerService,
              private rotationTipsService: RotationTipsService, public dirtyFacade: DirtyFacade, private cd: ChangeDetectorRef,
              private ipc: IpcService, public platformService: PlatformService, private simulationService: SimulationService,
              private lazyData: LazyDataFacade) {
    this.lazyData.preloadEntry('actions');
    this.lazyData.preloadEntry('craftActions');
    this.rotationsFacade.loadMyRotations();
    this.rotationsFacade.rotationCreated$.pipe(
      takeUntil(this.onDestroy$),
      filter(key => key !== undefined)
    ).subscribe(createdKey => {
      const commands = ['simulator'];
      if (this.custom) {
        commands.push('custom', createdKey);
      } else {
        commands.push(this.itemId.toString(), this._recipeId, createdKey);
      }
      this.router.navigate(commands);
    });

    this.statsForm = this.fb.group({
      job: [8, Validators.required],
      craftsmanship: [0, Validators.required],
      control: [0, Validators.required],
      cp: [180, Validators.required],
      level: [0, Validators.required],
      specialist: [false],
      splendorous: [false]
    });

    this.statsForm.valueChanges.pipe(
      distinctUntilKeyChanged('specialist'),
      takeUntil(this.onDestroy$)
    ).subscribe(() => {
      this.toggleSpecialist();
    });

    this.lazyData.getEntry('foods').subscribe(foods => {
      this.foods = consumablesService.fromLazyData(foods)
        .sort(this.consumablesSortFn);
    });

    this.lazyData.getEntry('medicines').subscribe(medicines => {
      this.medicines = consumablesService.fromLazyData(medicines)
        .sort(this.consumablesSortFn);
    });
    this.freeCompanyActions = freeCompanyActionsService.fromData(freeCompanyActions)
      .sort(this.freeCompanyActionsSortFn);
  }

  private _recipe: LazyRecipe;

  @Input()
  public set recipe(recipe: LazyRecipe) {
    this.recipe$.next(recipe);
    this._recipe = recipe;
    if (recipe.id) {
      this._recipeId = recipe.id.toString();
    }
  }

  @Input()
  public set hqIngredients(ingredients: { id: number, amount: number, quality: number }[]) {
    this.hqIngredients$.next(ingredients);
    this.startingQuality$.next(ingredients.reduce((total, ingredient) => {
      return total + ingredient.amount * ingredient.quality;
    }, 0));
  }

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  private get registry() {
    return this.simulator.CraftingActionsRegistry;
  }

  private markAsDirty(): void {
    this.dirty = true;
    this.dirtyFacade.addEntry('simulator', DirtyScope.PAGE);
  }

  filterOptions(input?: string, option?: NzOptionComponent): boolean {
    return option.nzLabel?.toString().toLowerCase().includes(input.toLowerCase());
  }

  findRotation(stats: CrafterStats): void {
    this.simulation$.pipe(
      first(),
      switchMap(simulation => {
        return this.dialog.create<CommunityRotationFinderPopupComponent, Partial<CommunityRotationFinderPopupComponent>, CraftingRotation>({
          nzFooter: null,
          nzContent: CommunityRotationFinderPopupComponent,
          nzData: {
            recipe: simulation.recipe,
            stats: stats
          },
          nzWidth: '60vw',
          nzTitle: this.translate.instant('SIMULATOR.Find_rotation')
        }).afterClose;
      }),
      filter(res => res && res.rotation.length > 0),
      withLazyData(this.lazyData, 'foods', 'medicines')
    ).subscribe(([rotation, lazyFoods, lazyMedicines]) => {

      const foods = this.consumablesService.fromLazyData(lazyFoods);
      const medicines = this.consumablesService.fromLazyData(lazyMedicines);

      if (rotation.food) {
        this.selectedFood = foods.find(f => f.itemId === rotation.food.id && f.hq === rotation.food.hq);
      } else {
        delete this.selectedFood;
      }
      if (rotation.medicine) {
        this.selectedMedicine = medicines.find(m => m.itemId === rotation.medicine.id && m.hq === rotation.medicine.hq);
      } else {
        delete this.selectedMedicine;
      }
      if (rotation.freeCompanyActions) {
        this.selectedFreeCompanyActions = this.freeCompanyActions.filter(action => rotation.freeCompanyActions.indexOf(action.actionId) > -1);
      } else {
        this.selectedFreeCompanyActions = [];
      }
      this.applyConsumables(stats);
      this.actions$.next(this.registry.deserializeRotation(rotation.rotation));
      this.stepStates$.next({});

      this.markAsDirty();
    });
  }

  openSharePopup(rotation: CraftingRotation, stats: CrafterStats): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: SimulationSharePopupComponent,
      nzData: {
        rotation: rotation,
        stats: stats,
        food: this.selectedFood,
        medicine: this.selectedMedicine,
        freeCompanyActions: this.selectedFreeCompanyActions
      },
      nzTitle: this.translate.instant('SIMULATOR.Share_button_tooltip')
    });
  }

  public openOverlay(rotation: CraftingRotation): void {
    this.ipc.openOverlay(`/rotation-overlay/${rotation.$key}`, '/rotation-overlay', IpcService.ROTATION_DEFAULT_DIMENSIONS);
  }

  nameCopied(key: string, args?: any): void {
    this.message.success(this.translate.instant(key, args));
  }

  resetToSavedRotation(rotation: CraftingRotation): void {
    this.actions$.next(this.registry.deserializeRotation(rotation.rotation));
    this.dirty = false;
    this.dirtyFacade.removeEntry('simulator', DirtyScope.PAGE);
  }

  changeRotation(): void {
    this.rotationPicker.openInSimulator(this.itemId, this._recipeId, true, this.custom);
  }

  getCraftOptExportString = () => {
    return this.registry.exportToCraftOpt(this.registry.serializeRotation(this.actions$.value));
  };

  changeRecipe(rotation: CraftingRotation): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: RecipeChoicePopupComponent,
      nzData: {
        rotationId: rotation.$key,
        warning: this.dirty ? 'SIMULATOR.Changing_recipe_save_warning' : null
      },
      nzTitle: this.translate.instant('Pick_a_recipe')
    }).afterClose
      .subscribe(pickedARecipe => {
        if (pickedARecipe) {
          this.hqIngredients = [];
        }
      });
  }

  showRotationTips(tips: RotationTip[], result: SimulationResult): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: RotationTipsPopupComponent,
      nzData: {
        tips: tips,
        result: result
      },
      nzTitle: this.translate.instant('SIMULATOR.Rotation_tips')
    });
  }

  renameRotation(rotation: CraftingRotation): void {
    this.markAsDirty();
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzData: { baseName: rotation.getName() },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const patched = new CraftingRotation();
        Object.assign(patched, {
          ...rotation,
          name: name
        });
        return patched;
      })
    ).subscribe(r => {
      this.unsavedChanges$.next(r);
    });
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
      ).subscribe(actions => {
      this.actions$.next(actions);
      this.stepStates$.next({});
    });
  }

  openMacroPopup(simulation: Simulation): void {
    this.dialog.create({
      nzContent: MacroPopupComponent,
      nzData: {
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
      nzData: {
        simulation: simulation.clone(),
        thresholds: this.thresholds
      },
      nzTitle: this.translate.instant('SIMULATOR.Min_stats'),
      nzFooter: null
    });
  }

  openStepByStepReportPopup(result: SimulationResult): void {
    this.dialog.create({
      nzContent: StepByStepReportComponent,
      nzData: {
        steps: result.steps
      },
      nzTitle: this.translate.instant('SIMULATOR.Step_by_step_report'),
      nzFooter: null
    });
  }

  importFromXIVMacro(): void {
    this.dialog.create({
      nzContent: TextQuestionPopupComponent,
      nzTitle: this.translate.instant('SIMULATOR.Import_macro'),
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => res !== undefined && res !== null && res.length > 0 && res.indexOf('/ac') > -1),
        switchMap(macro => {
          return this.i18n.getNameObservable('actions', new this.simulator.FinalAppraisal().getIds()[0]).pipe(
            switchMap(finalAppraisalName => {
              return safeCombineLatest(macro.split('\n').map(
                line => {
                  let match = this.findActionsRegex.exec(line);
                  if (match !== null && match !== undefined) {
                    const skillName = match[2].replace(/"/g, '');
                    if (line.startsWith('/statusoff') && FinalAppraisal && skillName === finalAppraisalName) {
                      return of(-1);
                    }

                    return this.i18n.getCraftingActionIdByName(skillName, <Language>this.translate.currentLang).pipe(
                      catchError(() => {
                        match = this.findActionsAutoTranslatedRegex.exec(line);
                        return this.i18n.getCraftingActionIdByName(match[2].trim(), <Language>this.translate.currentLang).pipe(
                          catchError(() => of(''))
                        );
                      })
                    );
                  }
                  return of(null);
                }
              ));
            })
          );
        }),
        map(actionIds => this.registry.createFromIds(actionIds.filter(id => id !== null))),
        first()
      ).subscribe(actions => {
      this.actions$.next(actions);
      this.stepStates$.next({});
    });
  }

  saveRotation(rotation: CraftingRotation): void {
    combineLatest([this.stats$, this.actions$, this.recipe$]).pipe(
      first()
    ).subscribe(([stats, actions]) => {
      if (this.custom) {
        // custom-specific behavior goes here if we find any.
      } else {
        rotation.defaultItemId = this.itemId;
        rotation.defaultRecipeId = this._recipeId;
      }
      rotation.recipe = {
        ...this._recipe,
        id: this._recipe.id?.toString(),
        hq: this._recipe.hq ? 1 : 0
      };
      rotation.stats = {
        jobId: stats.jobId,
        specialist: stats.specialist,
        craftsmanship: stats.craftsmanship,
        cp: stats.cp,
        control: stats._control,
        level: stats.level,
        splendorous: stats.splendorous
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
    delete rotation.community;
    delete rotation.public;
    delete rotation.usedInGuides;
    this.saveRotation(rotation);
  }

  addAction(action: CraftingAction, index?: number) {
    if (index === undefined) {
      this.actions$.next([...this.actions$.value, action]);
      this.markAsDirty();
      return;
    }

    const actions = this.actions$.value;
    actions.splice(index, 0, action);
    this.actions$.next([...actions]);

    const stepStates = { ...this.stepStates$.value };
    for (let i = index; i < actions.length; i++) {
      delete stepStates[i];
    }

    this.stepStates$.next(stepStates);
    this.markAsDirty();
  }

  actionDrop(event: CdkDragDrop<CraftingAction>): void {
    if (!this.target) return;
    const source = this.source;
    const stepTemplateElement: HTMLElement =
      this.stepTemplate.first.element.nativeElement;
    const rotationContainerElement: HTMLElement =
      stepTemplateElement.parentElement;

    stepTemplateElement.style.display = 'none';
    rotationContainerElement.removeChild(stepTemplateElement);

    if (this.stepTemplate.first._dropListRef.isDragging()) {
      this.stepTemplate.first._dropListRef.exit(this.dragRef);
    }

    this.target = null;
    this.source = null;
    this.dragRef = null;

    if (!source?.id.startsWith('rotation__container__step')) {
      this.addAction(event.item.data, this.targetIndex);
      return;
    }

    if (this.sourceIndex === this.targetIndex) return;
    const actions = [...this.actions$.value];
    moveItemInArray(actions, this.sourceIndex, this.targetIndex);
    this.actions$.next(actions);
    this.markAsDirty();
  }

  actionEnter({ item, container }: CdkDragEnter) {
    if (container === this.stepTemplate.first) return;
    const stepTemplateElement: HTMLElement =
      this.stepTemplate.first.element.nativeElement;
    const sourceElement: HTMLElement = item.dropContainer.element.nativeElement;
    const dropElement: HTMLElement = container.element.nativeElement;

    const elements = [].slice.call(dropElement.parentElement.children);
    if (this.source && sourceElement.id.startsWith('rotation__container__step')) {
      elements.splice(this.sourceIndex, 1);
    }

    const dragIndex: number = elements.indexOf(
      this.source ? stepTemplateElement : sourceElement
    );

    const dropIndex: number = elements.indexOf(dropElement);
    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = item.dropContainer;

      stepTemplateElement.style.width = `${this.boxWidth}px`;
      stepTemplateElement.style.height = `${this.boxHeight}px`;
    }

    this.targetIndex = dropIndex;
    this.target = container;
    this.dragRef = item._dragRef;

    stepTemplateElement.style.display = '';

    dropElement.parentElement.insertBefore(
      stepTemplateElement,
      dropIndex > dragIndex && dragIndex !== -1
        ? dropElement.nextSibling
        : dropElement
    );

    this.stepTemplate.first._dropListRef.enter(
      item._dragRef,
      item.element.nativeElement.offsetLeft,
      item.element.nativeElement.offsetTop
    );
  }

  removeAction(index: number): void {
    const actions = this.actions$.value;
    actions.splice(index, 1);
    this.actions$.next([...actions]);
    const stepStates = { ...this.stepStates$.value };
    for (let i = index; i < actions.length; i++) {
      delete stepStates[i];
    }

    this.stepStates$.next(stepStates);
    this.markAsDirty();
  }

  setState(index: number, state: StepState): void {
    const newStates = { ...this.stepStates$.value, [index]: state };
    if (state === this.simulator.StepState.EXCELLENT) {
      newStates[index + 1] = this.simulator.StepState.POOR;
    }
    if (state === this.simulator.StepState.POOR) {
      newStates[index - 1] = this.simulator.StepState.EXCELLENT;
    }
    this.stepStates$.next(newStates);
  }

  setFail(index: number, failed: boolean): void {
    if (failed) {
      this.fails$.next([
        ...this.fails$.value,
        index
      ]);
    } else {
      this.fails$.next(this.fails$.value.filter(i => i !== index));
    }
  }

  applyStats(): void {
    const rawForm = this.statsForm.getRawValue();
    const stats = new this.simulator.CrafterStats(
      rawForm.job,
      rawForm.craftsmanship,
      rawForm.control,
      rawForm.cp,
      rawForm.specialist,
      rawForm.splendorous,
      rawForm.level,
      this.availableLevels
    );
    this.customStats$.next(stats);
    this.message.success(this.translate.instant('SIMULATOR.Stats_applied'));
  }

  saveSet(): void {
    const rawForm = this.statsForm.getRawValue();
    const set: GearSet = {
      jobId: rawForm.job,
      level: rawForm.level,
      control: rawForm.control,
      craftsmanship: rawForm.craftsmanship,
      cp: rawForm.cp,
      specialist: rawForm.specialist,
      splendorous: rawForm.splendorous
    };
    this.authFacade.saveSet(set);
    this.savedSet = true;
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
    this.dirtyConsumables = false;
    this.bonuses$.next({
      craftsmanship: this.consumablesService.getBonusValue('Craftsmanship', crafterStats.craftsmanship, this.selectedFood, this.selectedMedicine, this.selectedFreeCompanyActions || []),
      control: this.consumablesService.getBonusValue('Control', crafterStats._control, this.selectedFood, this.selectedMedicine, this.selectedFreeCompanyActions || []),
      cp: this.consumablesService.getBonusValue('CP', crafterStats.cp, this.selectedFood, this.selectedMedicine, this.selectedFreeCompanyActions || [])
    });
  }

  getFreeCompanyActions(type: string): FreeCompanyAction[] {
    return this.freeCompanyActions.filter(action => action.type === <BonusType>type);
  }

  isFreeCompanyActionOptionDisabled(type: string, actionId: number): boolean {
    const actions = this.selectedFreeCompanyActions || [];

    return actions.find(action => action.type === type && action.actionId !== actionId) !== undefined;
  }

  getBuffIcon(effBuff: EffectiveBuff): string {
    return `./assets/icons/status/${this.simulator.Buff[effBuff.buff].toLowerCase()}.png`;
  }

  getProgressActions(): CraftingAction[] {
    return this.registry.getActionsByType(this.simulator.ActionType.PROGRESSION);
  }

  getQualityActions(): CraftingAction[] {
    return this.registry.getActionsByType(this.simulator.ActionType.QUALITY);
  }

  getBuffActions(): CraftingAction[] {
    return this.registry.getActionsByType(this.simulator.ActionType.BUFF);
  }

  getRepairActions(): CraftingAction[] {
    return this.registry.getActionsByType(this.simulator.ActionType.REPAIR);
  }

  getOtherActions(): CraftingAction[] {
    return [
      ...this.registry.getActionsByType(this.simulator.ActionType.OTHER),
      ...this.registry.getActionsByType(this.simulator.ActionType.CP_RECOVERY)
    ];
  }

  saveSafeMode(value: boolean): void {
    localStorage.setItem('simulator:safe-mode', value.toString());
  }

  toggleSpecialist(): void {
    const stats = this.statsForm.getRawValue();
    if (stats.specialist) {
      stats.craftsmanship += 20;
      stats.control += 20;
      stats.cp += 15;
    } else if (stats.craftsmanship > 0 && stats.control > 0 && stats.cp > 0) {
      stats.craftsmanship -= 20;
      stats.control -= 20;
      stats.cp -= 15;
    }
    this.statsForm.patchValue(stats, { emitEvent: false });
  }

  openCommunityRotationConfiguration(rotation: CraftingRotation, simulation: Simulation, stats: CrafterStats): void {
    this.cd.detach();
    this.dialog.create({
      nzContent: CommunityRotationPopupComponent,
      nzData: {
        rotation: rotation,
        simulation: simulation.clone(),
        bonuses: {
          craftsmanship: this.consumablesService.getBonusValue('Craftsmanship', stats.craftsmanship, this.selectedFood, this.selectedMedicine, this.selectedFreeCompanyActions || []),
          control: this.consumablesService.getBonusValue('Control', stats._control, this.selectedFood, this.selectedMedicine, this.selectedFreeCompanyActions || []),
          cp: this.consumablesService.getBonusValue('CP', stats.cp, this.selectedFood, this.selectedMedicine, this.selectedFreeCompanyActions || [])
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
    this.formChangesSubscription.unsubscribe();

    this.onDestroy$.next(null);
    this.unsavedChanges$.complete();
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.stepTemplate.changes,
      this.rotationContainer.changes
    ]).pipe(take(1)).subscribe(([stepTemplateQuery, rotationContainerQuery]) => {
      const stepTemplateElement = stepTemplateQuery.first.element.nativeElement;
      const rotationContainerElement = rotationContainerQuery.first.nativeElement;
      stepTemplateElement.style.display = 'none';
      rotationContainerElement.removeChild(stepTemplateElement);
    });
  }

  ngOnInit(): void {
    this.job$ = merge(
      this.recipe$.pipe(
        map(r => r.job || 8),
        this.custom ? first() : tap()
      ),
      this.customJob$
    ).pipe(tap(job => this.job = job));

    const statsFromRecipe$: Observable<CrafterStats> = combineLatest([this.recipe$, this.job$, this.authFacade.gearSets$.pipe(first())]).pipe(
      map(([, job, sets]) => {
        const set = sets.find(s => s.jobId === job);
        const levels = <CrafterLevels>sets.map(s => s.level);
        levels[job - 8] = set.level;
        if (this.routeStats) {
          set.craftsmanship = this.routeStats.craftsmanship;
          set.control = this.routeStats.control;
          set.cp = this.routeStats.cp;
          set.level = this.routeStats.level;
          set.specialist = this.routeStats.spec;
          set.splendorous = this.routeStats.splendorous;
        }
        return new this.simulator.CrafterStats(set.jobId, set.craftsmanship, set.control, set.cp, set.specialist, set.splendorous, set.level, levels);
      }),
      distinctUntilChanged((before, after) => {
        return JSON.stringify(before) === JSON.stringify(after);
      })
    );

    this.hqIngredientsData$ = this.recipe$.pipe(
      map(recipe => {
        return (recipe.ingredients || [])
          .filter(i => +i.id > 20 && i.quality > 0)
          .map(ingredient => ({ id: +ingredient.id, amount: 0, max: ingredient.amount, quality: ingredient.quality }));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.crafterStats$ = merge(statsFromRecipe$, this.customStats$).pipe(
      debounceTime(1000),
      shareReplay({ bufferSize: 1, refCount: true }),
      tap(stats => {
        const levels = stats.levels;
        levels[stats.jobId - 8] = stats.level;
        this.availableLevels = levels;
        this.statsForm.reset({
          job: stats.jobId,
          craftsmanship: stats.craftsmanship,
          control: stats._control,
          cp: stats.cp,
          level: stats.level,
          specialist: stats.specialist,
          splendorous: stats.splendorous
        }, { emitEvent: true });
      })
    );

    this.stats$ = combineLatest([
      this.crafterStats$,
      this.bonuses$,
      this.loggedIn$,
      this.job$
    ]).pipe(
      map(([stats, bonuses, loggedIn, job]) => {
        const levels = loggedIn ? stats.levels : [80, 80, 80, 80, 80, 80, 80, 80];
        levels[(job || stats.jobId) - 8] = stats.level;
        return new this.simulator.CrafterStats(
          job || stats.jobId,
          stats.craftsmanship + bonuses.craftsmanship,
          stats._control + bonuses.control,
          stats.cp + bonuses.cp,
          stats.specialist,
          stats.splendorous,
          stats.level,
          levels as CrafterLevels);
      })
    );

    this.statsTooLow$ = combineLatest([
      this.stats$,
      this.recipe$
    ]).pipe(
      map(([stats, recipe]) => {
        return recipe.controlReq > stats._control || recipe.craftsmanshipReq > stats.craftsmanship;
      })
    );

    this.levelTooLow$ = combineLatest([
      this.stats$,
      this.recipe$.pipe(
        switchMap(recipe => {
          return this.lazyData.getRow('craftingLevels', +recipe.id, 0);
        })
      )
    ]).pipe(
      map(([stats, levelReq]) => {
        if (levelReq === 255) {
          levelReq = 0;
        }
        return stats.level < levelReq;
      })
    );

    this.simulation$ = combineLatest([this.recipe$, this.actions$, this.stats$, this.hqIngredients$, this.stepStates$, this.fails$, this.forcedStartingQuality$]).pipe(
      map(([recipe, actions, stats, hqIngredients, stepStates, fails, forcedStartingQuality]: any[]) => {
        if (!recipe.conditionsFlag) {
          recipe.conditionsFlag = 15;
        }
        return new this.simulator.Simulation(recipe, actions, stats, hqIngredients, stepStates, fails, forcedStartingQuality);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    combineLatest([this.rotation$, this.crafterStats$, observeInput(this, 'routeConsumables', true)]).pipe(
      startWith([]),
      pairwise(),
      map(([before, after]) => {
        return [...after, before[0] ? before[0].$key !== after[0].$key : true];
      }),
      takeUntil(this.onDestroy$),
      withLazyData(this.lazyData, 'foods', 'medicines')
    ).subscribe(([[rotation, stats, routeConsumables, rotationChanged], lazyFoods, lazyMedicines]) => {
      if (this.actions$.value.length === 0 || rotationChanged) {
        this.actions$.next(this.registry.deserializeRotation(rotation.rotation));
        this.stepStates$.next({});
      }
      const foods = this.consumablesService.fromLazyData(lazyFoods);
      const medicines = this.consumablesService.fromLazyData(lazyMedicines);

      if (rotationChanged) {

        let food, medicine, fcActions = null;

        if (routeConsumables) {
          food = routeConsumables.food || rotation.food;
          medicine = routeConsumables.medicine || rotation.medicine;
          fcActions = routeConsumables.freeCompanyActions || rotation.freeCompanyActions;
        }

        if (food) {
          this.selectedFood = foods.find(f => f.itemId === food.id && f.hq === food.hq);
        } else {
          delete this.selectedFood;
        }
        if (medicine) {
          this.selectedMedicine = medicines.find(m => m.itemId === medicine.id && m.hq === medicine.hq);
        } else {
          delete this.selectedMedicine;
        }
        if (fcActions) {
          this.selectedFreeCompanyActions = this.freeCompanyActions.filter(action => fcActions.indexOf(action.actionId) > -1);
        } else {
          this.selectedFreeCompanyActions = [];
        }
      }
      this.applyConsumables(stats);
    });

    this.result$ = combineLatest([this.snapshotStep$, this.simulation$, this.safeMode$]).pipe(
      map(([snapshotStep, sim, safeMode]) => {
        sim.reset();
        if (this.snapshotMode) {
          return sim.run(true, snapshotStep, safeMode);
        } else {
          return sim.run(true, Infinity, safeMode);
        }
      }),
      tap(result => {
        this.actionFailed = result.steps.find(step => !step.success) !== undefined;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.result$.subscribe((resultData) => {
      if (this.placeholder.first && this.rotationContainer) {
        const placeholderElement = this.placeholder.first.element.nativeElement;
        const rotationContainerElement = this.rotationContainer.first.nativeElement;
        if (placeholderElement.style.display !== 'none' && resultData.steps.length > 0) {
          placeholderElement.style.display = 'none';
          rotationContainerElement.removeChild(placeholderElement);
        } else if (placeholderElement.style.display === 'none' && resultData.steps.length === 0) {
          placeholderElement.style.display = 'block';
          rotationContainerElement.appendChild(placeholderElement);
        }
      }

      const lists = [
        'rotation__container__step--placeholder',
        'rotation__container__step--template'
      ];

      for (const i in resultData.steps) {
        lists.push(`rotation__container__step--${i.toString()}`);
      }

      this.connectedDropLists = [...lists];
    });

    this.qualityPer100$ = this.result$.pipe(
      map(result => {
        const action = new this.simulator.BasicTouch();
        return Math.floor(action.getBaseQuality(result.simulation));
      })
    );

    this.progressPer100$ = this.result$.pipe(
      map(result => {
        const action = new this.simulator.BasicSynthesis();
        return Math.floor(action.getBaseProgression(result.simulation));
      })
    );

    this.report$ = combineLatest([this.simulation$, this.result$]).pipe(
      map(([simulation, result]) => {
        if (!result.success) {
          return {
            averageHQPercent: 0,
            medianHQPercent: 0,
            rawData: [],
            successPercent: 0,
            minHQPercent: 0,
            maxHQPercent: 0
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

    this.formChangesSubscription = this.statsForm.valueChanges.subscribe(() => {
      this.savedSet = false;
    });
  }

  trackByAction(index: number, step: ActionResult): number {
    return step.action.getId(8);
  }

  private consumablesSortFn = (a, b) => {
    if (a > b) {
      return 1;
    } else if (a < b) {
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

}
