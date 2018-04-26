import {ProgressAction} from '../progress-action';
import {Simulation} from '../../../simulation/simulation';

export class CarefulSynthesisIII extends ProgressAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 7;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 100;
    }

    getIds(): number[] {
        return [100203, 100204, 100205, 100206, 100207, 100208, 100209, 100210];
    }

    getPotency(): number {
        return 150;
    }

}
