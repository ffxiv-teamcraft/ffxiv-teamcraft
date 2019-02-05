import { ByregotsBlessing } from './byregots-blessing';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';
import { SimulationFailCause } from '../../simulation-fail-cause.enum';

export class ByregotsBrow extends ByregotsBlessing {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 51 };
  }

  _canBeUsed(simulation: Simulation): boolean {
    return super._canBeUsed(simulation) && simulation.getBuff(Buff.INNER_QUIET).stacks >= 2;
  }

  getFailCause(simulationState: Simulation, linear?: boolean, safeMode?: boolean): SimulationFailCause {
    if (!simulationState.hasBuff(Buff.INNER_QUIET)) {
      return SimulationFailCause.NO_INNER_QUIET;
    }
    return super.getFailCause(simulationState, linear, safeMode);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 18;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return simulationState.crafterStats.specialist ? 100 : 70;
  }

  getPotency(simulation: Simulation): number {
    return 150 + (simulation.getBuff(Buff.INNER_QUIET).stacks - 1) * 10;
  }

  getIds(): number[] {
    return [100120, 100121, 100122, 100123, 100124, 100125, 100126, 100127];
  }
}
