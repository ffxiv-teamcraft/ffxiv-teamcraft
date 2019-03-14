import { CraftingAction } from './crafting-action';
import { Simulation } from '../../simulation/simulation';
import { Buff } from '../buff.enum';
import { ActionType } from './action-type';
import { CraftingJob } from '../crafting-job.enum';
import { SimulationFailCause } from '../simulation-fail-cause.enum';

/**
 * SpecialtyAction is for the three R's, the actions that stop Initial preparation and add an effect.
 */
export abstract class SpecialtyAction extends CraftingAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 69 };
  }

  public getType(): ActionType {
    return ActionType.SPECIALTY;
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return simulationState.hasBuff(Buff.INITIAL_PREPARATIONS) && simulationState.crafterStats.specialist;
  }

  getFailCause(simulationState: Simulation, linear?: boolean, safeMode?: boolean): SimulationFailCause {
    if (!simulationState.crafterStats.specialist) {
      return SimulationFailCause.NOT_SPECIALIST;
    }
    super.getFailCause(simulationState, linear, safeMode);
  }

  execute(simulation: Simulation): void {
    this.applyReflect(simulation);
    simulation.removeBuff(Buff.INITIAL_PREPARATIONS);
  }

  abstract applyReflect(simulation: Simulation): void;

  getBaseCPCost(simulationState: Simulation): number {
    return 0;
  }

  getDurabilityCost(simulationState: Simulation): number {
    return 0;
  }

  getSuccessRate(simulationState: Simulation): number {
    return 100;
  }

}
