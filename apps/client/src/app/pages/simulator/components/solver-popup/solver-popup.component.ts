import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FlexModule } from "@angular/flex-layout";
import { TranslateModule } from "@ngx-translate/core";
import { NzButtonModule } from "ng-zorro-antd/button";
import { ActionComponent } from "../action/action.component";
import { DialogComponent } from "../../../../../app/core/dialog.component";
import { Craft, CraftingAction, CrafterStats } from "@ffxiv-teamcraft/simulator";
import { Subscription } from "rxjs";
import { SolverService } from "../../service/solver.service";
import { NzModalRef } from "ng-zorro-antd/modal";
import { NzTagModule } from "ng-zorro-antd/tag";
import { SimulationReliabilityReport, SimulationService } from "../../../../core/simulation/simulation.service";
import { ActionCategory } from '../../model/action-category';
import { SettingsService } from "apps/client/src/app/modules/settings/settings.service";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzSpinModule } from "ng-zorro-antd/spin";

/**
 * Class names (as reported by `action.constructor.name`) of Cosmic Exploration-only
 * actions, excluded from the default selection since they only apply to a small
 * subset of recipes. Kept in sync with the same list in `solver-core.ts`.
 */
const COSMIC_EXPLORATION_ACTION_NAMES = new Set<string>(['MaterialMiracle2', 'StellarSteadyHand2']);

/**
 * Class names of Specialist-only actions, excluded from the default selection.
 * Kept in sync with the same list in `solver-core.ts`.
 */
const SPECIALIST_ACTION_NAMES = new Set<string>(['CarefulObservation2', 'HeartAndSoul2', 'QuickInnovation2']);

/**
 * Class names of actions, that are technically safe by the recipe's starting-state
 * check, but rely on random crafting conditions (e.g. "Good"/"Excellent") to actually be
 * used reiably in practice. Excluded from the default selection, but still manually selectable
 * by the user
 */
const DEFAULT_EXCLUDED_UNRELIABLE_ACTION_NAMES = new Set<string>([
  'TricksOfTheTrade2'
]);

/** The three high-level phases the popup walks through. */
type SolverPhase = 'selection' | 'running' | 'done';


/**
 * Modal popup that runs the crafting rotation solver for the currently configured
 * recipe/stats, shows live search progress, and lets the user apply the resulting
 * rotation back into the simulator once the search completes.
 * 
 * Expects 'recipe', 'stats', and (optionally) 'hqIngredients' to be provided via
 * 'NZ_MODAL_DATA' / {@link DialogComponent.patchData}, following the same pattern as
 * the other simulator popups (e.g. 'MacroPopupComponent')
 */
@Component({
  selector: 'app-solver-popup',
  templateUrl: './solver-popup.component.html',
  styleUrls: ['./solver-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
    NzButtonModule,
    NzTagModule,
    NzIconModule,
    NzSpinModule,
    TranslateModule,
    ActionComponent
  ]
})
export class SolverPopupComponent extends DialogComponent implements OnInit, OnDestroy {
  /** Recipe to solve for. Provided via modal data */
  recipe: Craft;
  /** Crafter stats to solve with. Provided via modal data */
  stats: CrafterStats;
  /** Starting HQ ingredient quality contributions. Provided via modal data */
  hqIngredients: { id: number; amount: number }[] = [];

  /** Beam width passed to {@link SolverService.solve}. See its doc comment */
  beamWidth = 3000;
  /** Max rotation length passed to {@link SolverService.solve} */
  maxSteps = 45;
  /** Search time budget (ms) passed to {@link SolverService.solve} */
  maxComputeMs = 58000;

  /** Which step of the popup is currently shown */
  phase: SolverPhase = 'selection';

  /** Actions grouped by category for the selection grid, build in {@link ngOnInit} */
  categories: ActionCategory[] = [];
  /** Class names of actions the user has enabled for the solver to use */
  selectedActionNames = new Set<string>()

  /** Whether the solver is currently still searching */
  running = true;
  /** Current search depth, for progress display */
  depth = 0;
  /** Best quality value found so far, for progress display */
  bestQuality = 0;
  /** Whether any completed rotation has been found so far */
  bestSuccess = false;
  /** Whether the best rotation found so far also reaches full quality */
  qualityComplete = false;
  /** The final rotation, once the search completes */
  resultActions: CraftingAction[] = [];
  /** Reliability analysis of {@link resultActions}, once available */
  reliablity?: SimulationReliabilityReport;

  /** Whether the solver run failed with an error */
  error = false;
  /** Human-readable error message, if {@link error} is true; */
  errorMessage = '';

  private sub: Subscription;
  private solver: SolverService = inject(SolverService);
  private modalRef: NzModalRef = inject(NzModalRef);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  private simulationService: SimulationService = inject(SimulationService);
  private settings: SettingsService = inject(SettingsService);

  constructor() {
    super();
  }

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  /**
   * Populates inputs from modal data, then starts the solver run and subscibes to the
   * progress/result stream. Uses 'ChangeDetectorRef.markForCheck()' on every update
   * since this component uses 'OnPush' change detection and updates originalte from
   * Web Worker Messages (outside Angular's normal event handling)
   */
  ngOnInit(): void {
    this.patchData();
    this.buildCategories();
    this.initializeDefaultSelection();
  }

  /**
   * Builds the categorized action list shown in the selection grid, mirroring the category
   * breakdown used in the main simulator UI.
   */
  private buildCategories(): void {
    const registry = this.simulator.CraftingActionsRegistry;
    const ActionType = this.simulator.ActionType;

    this.categories = [
      { titleKey: 'SIMULATOR.CATEGORY.Progression', actions: registry.getActionsByType(ActionType.PROGRESSION) },
      { titleKey: 'SIMULATOR.CATEGORY.Quality', actions: registry.getActionsByType(ActionType.QUALITY) },
      { titleKey: 'SIMULATOR.CATEGORY.Buff', actions: registry.getActionsByType(ActionType.BUFF) },
      { titleKey: 'SIMULATOR.CATEGORY.Repair', actions: registry.getActionsByType(ActionType.REPAIR) },
      { 
        titleKey: 'SIMULATOR.CATEGORY.Other',
        actions: [
          ...registry.getActionsByType(ActionType.OTHER),
          ...registry.getActionsByType(ActionType.CP_RECOVERY)
        ]
      },
    ];
  }

  /**
   * Selects every action that is available at the crafter's level by default, except
   * Cosmic Exploration and Specialist actions, which are opt-in only.
   */
  private initializeDefaultSelection(): void {
    const sim = new this.simulator.Simulation(this.recipe, [], this.stats, this.hqIngredients);
    const baselineResult = sim.run(true, Infinity, true);
    const baselineSimulation = baselineResult.simulation;
    
    for (const category of this.categories) {
      for (const action of category.actions) {
        if (this.isLevelLocked(action)) continue;

        const name = this.actionName(action);
        if (COSMIC_EXPLORATION_ACTION_NAMES.has(name)) continue;
        if (SPECIALIST_ACTION_NAMES.has(name)) continue;
        if (DEFAULT_EXCLUDED_UNRELIABLE_ACTION_NAMES.has(name)) continue;

        if ((action as any).getSuccessRate?.(baselineSimulation) < 100) continue;

        this.selectedActionNames.add(name);
      }
    }
  }

  /**
   * Wheter the crafter's level is too low to ever use this action, regardles of
   * solver selection.
   * @param action The Action to check for level requirement
   */
  isLevelLocked(action: CraftingAction): boolean {
    const requirement = (action as any).getLevelRequirement();
    const CraftingJob = this.simulator.CraftingJob;
    if (requirement.job !== CraftingJob.ANY && this.stats.levels?.[requirement.job] !== undefined)
      return this.stats.levels[requirement.job] < requirement.level;

    return this.stats.level < requirement.level;
  }

  /** Wheter the given action is currently selected for the solver to use */
  isEnabled(action: CraftingAction): boolean {
    return this.selectedActionNames.has(this.actionName(action));
  }

  /** Toggles an action's inclusion in the solver's candidate pool. No-op for level-locked */
  toggleAction(action: CraftingAction): void {
    if (this.isLevelLocked(action)) return;
    const name = this.actionName(action);
    if (this.selectedActionNames.has(name))
      this.selectedActionNames.delete(name);
    else
      this.selectedActionNames.add(name);

    this.cd.markForCheck();
  }

  /** Returns the name of the Action */
  private actionName(action: CraftingAction): string {
    return (action as any).constructor?.name;
  }

  /** Advances from the selection step to actually running the solver */
  startSolving(): void {
    this.phase = 'running';
    this.running = true;
    this.cd.detectChanges();

    this.sub = this.solver
        .solve(
          this.recipe,
          this.stats,
          this.hqIngredients,
          this.beamWidth,
          this.maxSteps,
          this.maxComputeMs,
          [...this.selectedActionNames]
        )
        .subscribe({
          next: ({ progress, result, reliablity }) => {
            if (progress) {
              console.log('[SolverPopupComponent] Progress Result: ', progress);
              this.depth = progress.depth;
              this.bestQuality = progress.bestQuality;
              this.bestSuccess = progress.bestSuccess;
              this.qualityComplete = progress.qualityComplete;
              this.cd.markForCheck();
            } 
            if (result) {
              this.resultActions = result;
              this.reliablity = reliablity;
              this.running = false;
              this.phase = 'done';
              this.cd.markForCheck();
            }
          },
          error: (err) => {
            this.error = true;
            this.errorMessage = err?.message ?? String(err);
            this.running = false;
            console.error('[SolverPopupComponent] Progress Error: ', err);
            this.cd.markForCheck();
          }
        });
  }

  /** Closes the modal, returning the found rotation to the caller (e.g. the simulator) */
  apply(): void {
    this.modalRef.close(this.resultActions);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}