import { QualityAction } from '../quality-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class PatientTouch extends QualityAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 64 };
  }

  execute(simulation: Simulation): void {
    super.execute(simulation);
    if (simulation.hasBuff(Buff.INNER_QUIET) && simulation.getBuff(Buff.INNER_QUIET).stacks < 11) {
      simulation.getBuff(Buff.INNER_QUIET).stacks++;
    }
  }

  onFail(simulation: Simulation): void {
    simulation.getBuff(Buff.INNER_QUIET).stacks = Math.floor(simulation.getBuff(Buff.INNER_QUIET).stacks / 2);
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return true;
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 6;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 50;
  }

  getIds(): number[] {
    return [100219, 100220, 100221, 100222, 100223, 100224, 100225, 100226];
  }

  getPotency(simulation: Simulation): number {
    return 100;
  }

}
