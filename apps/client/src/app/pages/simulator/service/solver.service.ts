import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Craft, CrafterStats } from "@ffxiv-teamcraft/simulator";
import { SettingsService } from "../../../modules/settings/settings.service";
import { SimulationService } from "../../../core/simulation/simulation.service";
import { SolverEvent } from '../model/solver-event';

/**
 * Service that runs the crafting rotation solver in a background Web Worker
 * and exposes its progress/result as an observable stream.
 */
@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private settings: SettingsService = inject(SettingsService);
  private simulationService: SimulationService = inject(SimulationService);

  /**
   * Starts a solver run in a dedicated Web Worker for the given recipe and crafter
   * stats, and streams progress updates followed by the final result.
   * 
   * @param recipe The recipe/craft to solve for
   * @param stats The crafter's stats (craftsmanship, control, CP, level, specialist)
   * @param hqIngredients Optional starting HQ ingredient quality contributions
   * @param beamWidth Maximum number of candidate branches kept per search depth. High
   *        values explore more alternatives at the cost of more compution time
   * @param maxSteps Hard cap on the number of steps a generated rotation may contain
   * @param maxComputeMs Wall-clock time budget for the search, in milliseconds
   * @param shouldUseCosmicExploration Whether Cosmic Exploration-only Actions (e.g.
   *        Material Miracle, etc) may be used. Defaults to false
   * @param shouldUseSpecialistCommands Whether Specialist-only actions (e.g. Careful
   *        Observation, etc) may be used. Only takes effect if
   *        'stats.specialist' is also true. Defaults to false
   * @returns An observable emitting {@link SolverEvent}s. Completes after the final
   *        result event, or errors if the worker fails or Web Workers are unsupported
   */
  solve(recipe: Craft, stats: CrafterStats,
    hqIngredients: { id: number; amount: number }[] = [],
    beamWidth = 4000, maxSteps = 45, maxComputeMs = 55000,
    shouldUseCosmicExploration = false,
    shouldUseSpecialistCommands = false): Observable<SolverEvent> {
    return new Observable(subscriber => {
      if (typeof Worker === 'undefined') {
        subscriber.error(new Error('Web Workers are not supported in this environment.'));
        return;
      }

      const worker = new Worker(new URL('./solver.worker', import.meta.url), { type: 'module' });
      const registry = this.simulationService.getSimulator(this.settings.region).CraftingActionsRegistry;

      worker.onmessage = ({ data }) => {
        if (data.type === 'progress') {
          subscriber.next({ progress: data.progress });
        } else if (data.type === 'done') {
          subscriber.next({
            result: registry.deserializeRotation(data.serializedActions),
            reliablity: data.reliablity
          });
          subscriber.complete();
          worker.terminate();
        } else if (data.type === 'error') {
          subscriber.error(new Error(data.message));
        }
      };

      worker.onerror = err => {
        subscriber.error(err);
        worker.terminate();
      };

      worker.postMessage({
        recipe,
        stats: {
          jobId: stats.jobId,
          craftsmanship: stats.craftsmanship,
          control: stats._control,
          cp: stats.cp,
          specialist: stats.specialist,
          relicTool: stats.relicTool,
          level: stats.level,
          levels: stats.levels
        },
        hqIngredients,
        beamWidth,
        maxSteps,
        maxComputeMs,
        shouldUseCosmicExploration,
        shouldUseSpecialistCommands
      });

      return () => worker.terminate();
    });
  }
}