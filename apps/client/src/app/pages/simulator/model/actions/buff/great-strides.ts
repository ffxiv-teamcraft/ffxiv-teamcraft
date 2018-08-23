import { BuffAction } from '../buff-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class GreatStrides extends BuffAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 21 };
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 32;
  }

  getDuration(simulation: Simulation): number {
    return 3;
  }

  getIds(): number[] {
    return [260, 261, 262, 263, 264, 265, 266, 267];
  }

  protected getBuff(): Buff {
    return Buff.GREAT_STRIDES;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  protected getTick(): (simulation: Simulation) => void {
    return undefined;
  }

}
