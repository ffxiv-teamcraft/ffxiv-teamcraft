import { BuffAction } from '../buff-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class Innovation extends BuffAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.GSM, level: 50 };
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 18;
  }

  getBuff(): Buff {
    return Buff.INNOVATION;
  }

  getDuration(simulation: Simulation): number {
    return 3;
  }

  getIds(): number[] {
    return [284];
  }

  getInitialStacks(): number {
    return 0;
  }

  getTick(): (simulation: Simulation) => void {
    return undefined;
  }

}
