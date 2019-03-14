import { CraftingAction } from '../crafting-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { ActionType } from '../action-type';
import { CraftingJob } from '../../crafting-job.enum';
import { SimulationFailCause } from '../../simulation-fail-cause.enum';

export class Rumination extends CraftingAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.CRP, level: 15 };
  }

  public getType(): ActionType {
    return ActionType.CP_RECOVERY;
  }

  _canBeUsed(simulationState: Simulation): boolean {
    return simulationState.hasBuff(Buff.INNER_QUIET);
  }

  getFailCause(simulationState: Simulation, linear?: boolean, safeMode?: boolean): SimulationFailCause {
    if (!simulationState.hasBuff(Buff.INNER_QUIET)) {
      return SimulationFailCause.NO_INNER_QUIET;
    }
    return super.getFailCause(simulationState, linear, safeMode);
  }

  execute(simulation: Simulation): void {
    // Formulae from https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L594
    simulation.availableCP += ((simulation.getBuff(Buff.INNER_QUIET).stacks - 1) * 21 -
      Math.pow((simulation.getBuff(Buff.INNER_QUIET).stacks - 1), 2) + 10) / 2;
    if (simulation.availableCP > simulation.maxCP) {
      simulation.availableCP = simulation.maxCP;
    }
    simulation.removeBuff(Buff.INNER_QUIET);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 0;
  }

  getDurabilityCost(simulationState: Simulation): number {
    return 0;
  }

  getIds(): number[] {
    return [276];
  }

  getSuccessRate(simulationState: Simulation): number {
    return 100;
  }

}
