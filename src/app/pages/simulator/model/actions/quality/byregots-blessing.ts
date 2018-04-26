import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {QualityAction} from '../quality-action';

export class ByregotsBlessing extends QualityAction {

    canBeUsed(simulationState: Simulation): boolean {
        return simulationState.hasBuff(Buff.INNER_QUIET);
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
        return 100 + simulation.getBuff(Buff.INNER_QUIET).stacks * 20;
    }

}
