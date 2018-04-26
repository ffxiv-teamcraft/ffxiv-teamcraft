import {GeneralAction} from '../general-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

/**
 * Because the amount provided by Flawless Synthesis is fixed, we won't use ProgressAction as parent for it.
 */
export class FlawlessSynthesis extends GeneralAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    execute(simulation: Simulation): void {
        simulation.progression += 40;
    }

    getBaseCPCost(simulationState: Simulation): number {
        // If maker's mark is active, this costs 0, else it costs 15.
        return simulationState.hasBuff(Buff.MAKERS_MARK) ? 0 : 15;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        // Maker's mark reduces durability used by Flawless Synthesis to 0.
        return simulationState.hasBuff(Buff.MAKERS_MARK) ? 0 : 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 90;
    }

    getIds(): number[] {
        return [100083];
    }

    getPotency(): number {
        return 0;
    }

}
