import { QualityAction } from '../quality-action';
import { Simulation } from '../../../simulation/simulation';
import { CraftingJob } from '../../crafting-job.enum';

export class BasicTouch extends QualityAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 5 };
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return true;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 70;
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 18;
  }

  getIds(): number[] {
    return [100002, 100016, 100031, 100076, 100046, 100061, 100091, 100106];
  }

  getPotency(simulation: Simulation): number {
    return 100;
  }

}
