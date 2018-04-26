import {QualityAction} from '../quality-action';
import {Simulation} from '../../../simulation/simulation';

export class HastyTouch extends QualityAction {

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
        return 50;
    }

    getIds(): number[] {
        return [100108];
    }

    getPotency(simulation: Simulation): number {
        return 100;
    }

}
