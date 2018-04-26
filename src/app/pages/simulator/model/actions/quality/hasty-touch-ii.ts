import {QualityAction} from '../quality-action';
import {Simulation} from '../../../simulation/simulation';

export class HastyTouchII extends QualityAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 5;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 60;
    }

    getIds(): number[] {
        return [100195, 100196, 100197, 100198, 100199, 100200, 100201, 100202];
    }

    getPotency(simulation: Simulation): number {
        return 100;
    }

}
