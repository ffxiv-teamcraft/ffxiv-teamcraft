import { BuffAction } from '../buff-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { ActionType } from '../action-type';
import { CraftingJob } from '../../crafting-job.enum';

export class Manipulation extends BuffAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.GSM, level: 15 };
  }

  public getType(): ActionType {
    return ActionType.REPAIR;
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 88;
  }

  getDuration(simulation: Simulation): number {
    return 3;
  }

  getWaitDuration(): number {
    return 2;
  }

  getIds(): number[] {
    return [278];
  }

  public getOverrides(): Buff[] {
    return super.getOverrides().concat(Buff.MANIPULATION_II);
  }

  protected getBuff(): Buff {
    return Buff.MANIPULATION;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  protected getTick(): (simulation: Simulation) => void {
    return (simulation: Simulation) => {
      simulation.repair(10);
    };
  }

}
