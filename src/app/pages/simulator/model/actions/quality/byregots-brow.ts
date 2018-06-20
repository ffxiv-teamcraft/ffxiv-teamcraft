import {ByregotsBlessing} from './byregots-blessing';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {CraftingJob} from '../../crafting-job.enum';

export class ByregotsBrow extends ByregotsBlessing {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.ANY, level: 51};
    }

    _canBeUsed(simulation: Simulation): boolean {
        return super._canBeUsed(simulation) && simulation.getBuff(Buff.INNER_QUIET).stacks >= 2;
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
