import { inject, Injectable, NgZone } from "@angular/core";
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
  private zone: NgZone = inject(NgZone);

  /**
   * Creates the web worker in a way that is safe even when the built worker
   * script is served from a different origin than the page (CDN). Worker
   * construction requires same-origin script URLs unconditionally
   * so instead we fetch the script's source as text ourselves (which IS allowed cross-origin given
   * permissive CORS headers) and construct the worker from a same-origin `blob:` URL.
   */
  private async createWorker(): Promise<Worker> {
    try {
      return new Worker(new URL('./solver.worker', import.meta.url), { type: 'module' });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'SecurityError') {
        const match = /Script at '([^']+)/.exec(err.message);
        const scriptUrl = match?.[1];
        if (!scriptUrl) throw err;

        const response = await fetch(scriptUrl);
        if (!response.ok)
          throw new Error(`Failed to fetch solver worker script: ${response.status} ${response.statusText}`);

        const source = await response.text();
        const blob = new Blob([source], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        return new Worker(blobUrl, { type: 'module' });
      }
      throw err;
    }
  }

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
    enabledActionIds: number[] = []
  ): Observable<SolverEvent> {
    return new Observable(subscriber => {
      if (typeof Worker === 'undefined') {
        subscriber.error(new Error('Web Workers are not supported in this environment'));
        return;
      }
      
      const registry = this.simulationService.getSimulator(this.settings.region).CraftingActionsRegistry;
      let worker: Worker;

      this.createWorker()
        .then(createdWorker => {
          worker = createdWorker;

          worker.onmessage = ({ data }) => {
            this.zone.run(() => {
              if (data.type === 'progress')
                subscriber.next({ progress: data.progress });
              else if (data.type === 'done') {
                subscriber.next({
                  result: registry.deserializeRotation(data.serializedActions),
                  reliablity: data.reliablity
                });
                subscriber.complete();
                worker.terminate();
              }
              else if (data.type === 'error')
                subscriber.error(new Error(data.message));
            });
          };

          worker.onerror = err => {
            this.zone.run(() => subscriber.error(err));
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
            enabledActionIds
          });
        })
        .catch(err => this.zone.run(() => subscriber.error(err)));

        return () => worker?.terminate();
    });
  }
}