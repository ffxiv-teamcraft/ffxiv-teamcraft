import { CraftingAction } from '../crafting-action';
import { Simulation } from '../../../simulation/simulation';
import { ActionType } from '../action-type';
import { CraftingJob } from '../../crafting-job.enum';

export class TricksOfTheTrade extends CraftingAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ALC, level: 15 };
  }

  public getType(): ActionType {
    return ActionType.CP_RECOVERY;
  }

  _canBeUsed(simulationState: Simulation, linear = false): boolean {
    if (linear) {
      return true;
    }
    if (simulationState.safe) {
      return false;
    }
    return simulationState.state === 'GOOD' || simulationState.state === 'EXCELLENT';
  }

  execute(simulation: Simulation): void {
    simulation.availableCP += 20;
    if (simulation.availableCP > simulation.maxCP) {
      simulation.availableCP = simulation.maxCP;
    }
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 0;
  }

  getIds(): number[] {
    return [100098];
  }

  getSuccessRate(simulationState: Simulation): number {
    return 100;
  }

  getDurabilityCost(simulationState: Simulation): number {
    return 0;
  }

}
