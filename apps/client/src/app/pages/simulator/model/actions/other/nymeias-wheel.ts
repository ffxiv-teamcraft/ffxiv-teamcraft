import { CraftingAction } from '../crafting-action';
import { Simulation } from '../../../simulation/simulation';
import { ActionType } from '../action-type';
import { Tables } from '../../tables';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';
import { SimulationFailCause } from '../../simulation-fail-cause.enum';

export class NymeiasWheel extends CraftingAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 57 };
  }

  _canBeUsed(simulationState: Simulation, linear?: boolean): boolean {
    return simulationState.crafterStats.specialist && simulationState.hasBuff(Buff.WHISTLE_WHILE_YOU_WORK);
  }

  getFailCause(simulationState: Simulation, linear?: boolean, safeMode?: boolean): SimulationFailCause {
    if (!simulationState.crafterStats.specialist) {
      return SimulationFailCause.NOT_SPECIALIST;
    }
    super.getFailCause(simulationState, linear, safeMode);
  }

  execute(simulation: Simulation): void {
    simulation.repair(Tables.NYMEIAS_WHEEL_TABLE[simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks]);
    simulation.removeBuff(Buff.WHISTLE_WHILE_YOU_WORK);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 18;
  }

  getDurabilityCost(simulationState: Simulation): number {
    return 0;
  }

  getIds(): number[] {
    return [100153, 100154, 100153, 100156, 100157, 100158, 100159, 100160];
  }

  getSuccessRate(simulationState: Simulation): number {
    return 0;
  }

  getType(): ActionType {
    return ActionType.REPAIR;
  }
}
