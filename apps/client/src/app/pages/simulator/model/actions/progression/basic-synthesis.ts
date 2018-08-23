import { ProgressAction } from '../progress-action';
import { Simulation } from '../../../simulation/simulation';
import { CraftingJob } from '../../crafting-job.enum';

export class BasicSynthesis extends ProgressAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 1 };
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return true;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 90;
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 0;
  }

  getIds(): number[] {
    return [100001, 100015, 100030, 100075, 100045, 100060, 100090, 100105];
  }

  getPotency(simulation: Simulation): number {
    return 100;
  }

}
