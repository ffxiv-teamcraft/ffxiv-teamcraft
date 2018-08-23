import { CraftingAction } from '../crafting-action';
import { Simulation } from '../../../simulation/simulation';
import { ActionType } from '../action-type';
import { CraftingJob } from '../../crafting-job.enum';

export class MastersMend extends CraftingAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 7 };
  }

  public getType(): ActionType {
    return ActionType.REPAIR;
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return true;
  }

  execute(simulation: Simulation): void {
    simulation.repair(30);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 92;
  }

  getDurabilityCost(simulationState: Simulation): number {
    return 0;
  }

  getIds(): number[] {
    return [100003, 100017, 100032, 100047, 100062, 100077, 100092, 100107];
  }

  getSuccessRate(simulationState: Simulation): number {
    return 100;
  }
}
