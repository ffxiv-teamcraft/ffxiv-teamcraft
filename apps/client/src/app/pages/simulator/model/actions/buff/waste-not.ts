import { BuffAction } from '../buff-action';
import { Buff } from '../../buff.enum';
import { Simulation } from '../../../simulation/simulation';
import { CraftingJob } from '../../crafting-job.enum';

export class WasteNot extends BuffAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.LTW, level: 15 };
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 56;
  }

  getDuration(simulation: Simulation): number {
    return 4;
  }

  getIds(): number[] {
    return [279];
  }

  public getOverrides(): Buff[] {
    return super.getOverrides().concat(Buff.WASTE_NOT_II);
  }

  protected getBuff(): Buff {
    return Buff.WASTE_NOT;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  protected getTick(): (simulation: Simulation) => void {
    return undefined;
  }

}
