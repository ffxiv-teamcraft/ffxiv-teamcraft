import { GeneralAction } from '../general-action';
import { Simulation } from '../../../simulation/simulation';
import { ActionType } from '../action-type';
import { CraftingJob } from '../../crafting-job.enum';

/**
 * PbP is not considered as a progression action as it isn't afected by progression buffs (Ingenuity, Ingenuity II, etc)
 */
export class PieceByPiece extends GeneralAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ARM, level: 50 };
  }

  public getType(): ActionType {
    return ActionType.PROGRESSION;
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return true;
  }

  execute(simulation: Simulation): void {
    const remainingProgress = simulation.recipe.progress - simulation.progression;
    simulation.progression += Math.floor(remainingProgress * 0.33);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 15;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 90;
  }

  getIds(): number[] {
    return [100039];
  }

  getPotency(): number {
    return 0;
  }

}
