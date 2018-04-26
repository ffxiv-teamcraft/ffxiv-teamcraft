import {QualityAction} from '../quality-action';
import {Simulation} from '../../../simulation/simulation';

export class StandardTouch extends QualityAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 32;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 80;
    }

    getIds(): number[] {
        return [100004, 100018, 100034, 100048, 100064, 100078, 100093, 100109];
    }

    getPotency(simulation: Simulation): number {
        return 125;
    }

}
