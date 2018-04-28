import {QualityAction} from '../quality-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class PreciseTouch extends QualityAction {

    execute(simulation: Simulation): void {
        super.execute(simulation);
        if (simulation.getBuff(Buff.INNER_QUIET).stacks < 11) {
            simulation.getBuff(Buff.INNER_QUIET).stacks++;
        }
    }

    canBeUsed(simulationState: Simulation, linear = false): boolean {
        if (linear) {
            return true
        }
        return simulationState.state === 'GOOD' || simulationState.state === 'EXCELLENT';
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 18;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 70;
    }

    getIds(): number[] {
        return [100128, 100129, 100130, 100131, 100132, 100133, 100134, 100135];
    }

    getPotency(simulation: Simulation): number {
        return 100;
    }

}
