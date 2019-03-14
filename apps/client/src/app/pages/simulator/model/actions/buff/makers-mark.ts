import { BuffAction } from '../buff-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class MakersMark extends BuffAction {

  getWaitDuration(): number {
    return 3;
  }

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.GSM, level: 54 };
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 20;
  }

  getDuration(simulation: Simulation): number {
    return Math.floor(simulation.recipe.progress / 100) + 1;
  }

  getIds(): number[] {
    return [100178];
  }

  _canBeUsed(simulation: Simulation): boolean {
    return super._canBeUsed(simulation) && simulation.steps.length === 0;
  }

  protected getBuff(): Buff {
    return Buff.MAKERS_MARK;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  protected getTick(): (simulation: Simulation) => void {
    return undefined;
  }


}
