import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Craft, CrafterStats, CraftingAction } from "@ffxiv-teamcraft/simulator";
import { SettingsService } from "../../../modules/settings/settings.service";
import { SimulationService } from "../../../core/simulation/simulation.service";

export interface SolverEvent {
  progress?: { depth: number; bestQuality: number; bestSuccess: boolean };
  result?: CraftingAction[];
}

@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private settings: SettingsService = inject(SettingsService);
  private simulationService: SimulationService = inject(SimulationService);

  solve(recipe: Craft, stats: CrafterStats,
    hqIngredients: { id: number; amount: number }[] = [],
    beamWidth = 300, maxSteps = 28): Observable<SolverEvent> {
      return new Observable(subscriber => {
        if (typeof Worker === 'undefined') {
          subscriber.error(new Error('Web Workers are not supported in this environment'));
          return;
        }

        const worker = new Worker(new URL('./solver.worker', import.meta.url), { type: 'module' });
        const registry = this.simulationService.getSimulator(this.settings.region).CraftingActionsRegistry;

        worker.onmessage = ({ data }) => {
          if (data.type === 'progress')
            subscriber.next({ progress: data.progress });
          else if (data.type === 'done') {
            subscriber.next({ result: registry.deserializeRotation(data.serializedActions) });
            subscriber.complete();
            worker.terminate();
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
          maxSteps
        });

        return () => worker.terminate();
      });
  }
}