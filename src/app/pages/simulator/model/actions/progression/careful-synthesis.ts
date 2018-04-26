import {ProgressAction} from '../progress-action';
import {Simulation} from '../../../simulation/simulation';

export class CarefulSynthesis extends ProgressAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 0;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 100;
    }

    getIds(): number[] {
        return [100063];
    }

    getPotency(simulation: Simulation): number {
        return 90;
    }

}
