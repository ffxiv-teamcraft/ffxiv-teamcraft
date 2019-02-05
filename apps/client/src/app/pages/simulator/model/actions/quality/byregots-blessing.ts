import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { QualityAction } from '../quality-action';
import { CraftingJob } from '../../crafting-job.enum';
import { SimulationFailCause } from '../../simulation-fail-cause.enum';

export class ByregotsBlessing extends QualityAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.CRP, level: 50 };
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
    super.execute(simulation);
    simulation.removeBuff(Buff.INNER_QUIET);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 24;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 90;
  }

  getIds(): number[] {
    return [100009];
  }

  getPotency(simulation: Simulation): number {
    return 100 + (simulation.getBuff(Buff.INNER_QUIET).stacks - 1) * 20;
  }

}
