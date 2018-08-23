import { ProgressAction } from '../progress-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class WhistleEndProgressionTick extends ProgressAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 55 };
  }

  canBeMoved(): boolean {
    return false;
  }

  _canBeUsed(simulationState: Simulation, linear?: boolean): boolean {
    return simulationState.hasBuff(Buff.WHISTLE_WHILE_YOU_WORK) &&
      simulationState.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks === 0;
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
    // Same ids as WwyW as it's just for display.
    return [100187, 100188, 100189, 100190, 100190, 100192, 100193, 100194];
  }

  getPotency(simulation: Simulation): number {
    return 200;
  }

}
