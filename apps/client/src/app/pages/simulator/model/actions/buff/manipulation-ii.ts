import { BuffAction } from '../buff-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { ActionType } from '../action-type';
import { CraftingJob } from '../../crafting-job.enum';

export class ManipulationII extends BuffAction {

  getWaitDuration(): number {
    return 2;
  }

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 65 };
  }

  public getType(): ActionType {
    return ActionType.REPAIR;
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 96;
  }

  getDuration(simulation: Simulation): number {
    return 8;
  }

  getIds(): number[] {
    return [4574, 4575, 4576, 4577, 4578, 4579, 4580, 4581];
  }

  public getOverrides(): Buff[] {
    return super.getOverrides().concat(Buff.MANIPULATION);
  }

  protected getBuff(): Buff {
    return Buff.MANIPULATION_II;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  protected getTick(): (simulation: Simulation) => void {
    return (simulation: Simulation) => {
      simulation.repair(5);
    };
  }

}
