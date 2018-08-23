import { ProgressAction } from '../progress-action';
import { Simulation } from '../../../simulation/simulation';
import { CraftingJob } from '../../crafting-job.enum';

export class CarefulSynthesisII extends ProgressAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.WVR, level: 50 };
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return true;
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 0;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 100;
  }

  getIds(): number[] {
    return [100069];
  }

  getPotency(simulation: Simulation): number {
    return 120;
  }

}
