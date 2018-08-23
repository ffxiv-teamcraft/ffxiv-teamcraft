import { QualityAction } from '../quality-action';
import { Simulation } from '../../../simulation/simulation';
import { CraftingJob } from '../../crafting-job.enum';

export class HastyTouch extends QualityAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.CUL, level: 15 };
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
    return 50;
  }

  getIds(): number[] {
    return [100108];
  }

  getPotency(simulation: Simulation): number {
    return 100;
  }

}
