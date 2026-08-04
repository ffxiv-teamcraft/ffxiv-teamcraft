import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FlexModule } from "@angular/flex-layout";
import { TranslateModule } from "@ngx-translate/core";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzProgressModule } from "ng-zorro-antd/progress";
import { ActionComponent } from "../action/action.component";
import { DialogComponent } from "../../../../../app/core/dialog.component";
import { Craft, CraftingAction, CrafterStats } from "@ffxiv-teamcraft/simulator";
import { Subscription } from "rxjs";
import { SolverService } from "../../service/solver.service";
import { NzModalRef } from "ng-zorro-antd/modal";
import { NzTagModule } from "ng-zorro-antd/tag";
import { SimulationReliabilityReport } from "../../../../core/simulation/simulation.service";

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
    NzProgressModule,
    NzButtonModule,
    NzTagModule,
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

  /**
   * Whether Cosmic Exploration-only actions may be used by the solver. Reserved for
   * future UI toggle. Defaults to false since these actions only apply to a small
   * subset of recipes and are not available under normal circumstances
   */
  shouldUseCosmicExploration = false;

  /**
   * Whether Specialist-only actions may be used by the solver. Reserved for a future UI
   * toggle. Defaults to false. Even when true, these actions are only actually considered by
   * the solver if 'stats.specialist' is also true (see {@link SolverService.solve})
   */
  shouldUseSpecialistCommands = false;

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

  constructor() {
    super();
  }

  /**
   * Populates inputs from modal data, then starts the solver run and subscibes to the
   * progress/result stream. Uses 'ChangeDetectorRef.markForCheck()' on every update
   * since this component uses 'OnPush' change detection and updates originalte from
   * Web Worker Messages (outside Angular's normal event handling)
   */
  ngOnInit(): void {
    this.patchData();
    this.sub = this.solver.solve(
      this.recipe,
      this.stats,
      this.hqIngredients,
      this.beamWidth,
      this.maxSteps,
      this.maxComputeMs,
      this.shouldUseCosmicExploration,
      this.shouldUseSpecialistCommands
    ).subscribe({
      next: ({ progress, result, reliablity }) => {
        if (progress) {
          this.depth = progress.depth;
          this.bestQuality = progress.bestQuality;
          this.bestSuccess = progress.bestSuccess;
          this.qualityComplete = progress.qualityComplete;
        }
        if (result) {
          this.resultActions = result;
          this.reliablity = reliablity;
          this.running = false;
        }
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('[SolverPopupComponent] error', err);
        this.error = true;
        this.errorMessage = err?.message ?? String(err);
        this.running = false;
        this.cd.markForCheck();
      }
    });
  }

  /** Closes the modal, returning the found rotation to the caller (e.g. the simulator) */
  apply(): void {
    this.modalRef.close(this.resultActions);
  }

  /** Formats the quality progress bar label as "current / target" */
  progressFormat(): () => string {
    return () => `${this.bestQuality} / ${this.recipe.quality}`;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}