import { BuffAction } from '../buff-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class SteadyHand extends BuffAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 9 };
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 22;
  }

  getDuration(simulation: Simulation): number {
    return 5;
  }

  getIds(): number[] {
    return [244, 245, 246, 247, 248, 249, 250, 251];
  }

  public getOverrides(): Buff[] {
    return super.getOverrides().concat(Buff.STEADY_HAND_II);
  }

  protected getBuff(): Buff {
    return Buff.STEADY_HAND;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  // Steady hand has no tick.
  protected getTick(): (simulation: Simulation) => void {
    return undefined;
  }


}
