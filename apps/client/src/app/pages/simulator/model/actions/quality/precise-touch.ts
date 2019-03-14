import { QualityAction } from '../quality-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class PreciseTouch extends QualityAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 53 };
  }

  execute(simulation: Simulation): void {
    super.execute(simulation);
    if (simulation.hasBuff(Buff.INNER_QUIET) && simulation.getBuff(Buff.INNER_QUIET).stacks < 11) {
      simulation.getBuff(Buff.INNER_QUIET).stacks++;
    }
  }

  _canBeUsed(simulationState: Simulation, linear = false): boolean {
    if (linear) {
      return true;
    }
    if (simulationState.safe) {
      return false;
    }
    return simulationState.state === 'GOOD' || simulationState.state === 'EXCELLENT';
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 18;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 70;
  }

  getIds(): number[] {
    return [100128, 100129, 100130, 100131, 100132, 100133, 100134, 100135];
  }

  getPotency(simulation: Simulation): number {
    return 100;
  }

}
