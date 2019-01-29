import { BuffAction } from '../buff-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { ActionType } from '../action-type';
import { CraftingJob } from '../../crafting-job.enum';

export class ComfortZone extends BuffAction {

  getWaitDuration(): number {
    return 2;
  }

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ALC, level: 50 };
  }

  public getType(): ActionType {
    return ActionType.CP_RECOVERY;
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 66;
  }

  getDuration(simulation: Simulation): number {
    return 10;
  }

  getIds(): number[] {
    return [286];
  }

  protected getBuff(): Buff {
    return Buff.COMFORT_ZONE;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  protected getTick(): (simulation: Simulation) => void {
    return (simulation) => {
      simulation.availableCP += 8;
      if (simulation.availableCP > simulation.maxCP) {
        simulation.availableCP = simulation.maxCP;
      }
    };
  }

}
