import { QualityAction } from '../quality-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class PrudentTouch extends QualityAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 66 };
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return !simulationState.hasBuff(Buff.WASTE_NOT_II) && !simulationState.hasBuff(Buff.WASTE_NOT);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 21;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 5;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 70;
  }

  getIds(): number[] {
    return [100227, 100228, 100229, 100230, 100231, 100232, 100233, 100234];
  }

  getPotency(simulation: Simulation): number {
    return 100;
  }
}
