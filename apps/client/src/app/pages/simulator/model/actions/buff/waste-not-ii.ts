import { BuffAction } from '../buff-action';
import { Buff } from '../../buff.enum';
import { Simulation } from '../../../simulation/simulation';
import { CraftingJob } from '../../crafting-job.enum';

export class WasteNotII extends BuffAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.LTW, level: 50 };
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 98;
  }

  getDuration(simulation: Simulation): number {
    return 8;
  }

  getIds(): number[] {
    return [285];
  }

  public getOverrides(): Buff[] {
    return super.getOverrides().concat(Buff.WASTE_NOT);
  }

  protected getBuff(): Buff {
    return Buff.WASTE_NOT_II;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  protected getTick(): (simulation: Simulation) => void {
    return undefined;
  }

}
