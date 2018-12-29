import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { QualityAction } from '../quality-action';
import { CraftingJob } from '../../crafting-job.enum';

export class ByregotsMiracle extends QualityAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 58 };
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return simulationState.hasBuff(Buff.INNER_QUIET) && simulationState.crafterStats.specialist;
  }

  execute(simulation: Simulation): void {
    // Don't add stack now, We'll add it manually after the reduction is done.
    super.execute(simulation, true);
    // Stacks are divided by 2 and rounded up
    simulation.getBuff(Buff.INNER_QUIET).stacks = Math.ceil(simulation.getBuff(Buff.INNER_QUIET).stacks / 2);
  }

  onFail(simulation: Simulation): void {
    // Stacks are still reduced upon failing.
    simulation.getBuff(Buff.INNER_QUIET).stacks = Math.floor(simulation.getBuff(Buff.INNER_QUIET).stacks / 2);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 70;
  }

  getIds(): number[] {
    return [100145, 100146, 100147, 100148, 100149, 100150, 100151, 100152];
  }

  getPotency(simulation: Simulation): number {
    return 100 + (simulation.getBuff(Buff.INNER_QUIET).stacks - 1) * 15;
  }
}
