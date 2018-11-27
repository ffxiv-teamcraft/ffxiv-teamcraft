import { BuffAction } from '../buff-action';
import { CraftingJob } from '../../crafting-job.enum';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';

export class Reclaim extends BuffAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.CUL, level: 50 };
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 55;
  }

  getDuration(simulation: Simulation): number {
    return Infinity;
  }

  getIds(): number[] {
    return [287];
  }

  protected getBuff(): Buff {
    return Buff.RECLAIM;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  // Reclaim doesn't tick.
  protected getTick(): (simulation: Simulation) => void {
    return undefined;
  }


}
