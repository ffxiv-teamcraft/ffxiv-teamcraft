import {QualityAction} from '../quality-action';
import {Simulation} from '../../../simulation/simulation';

export class PrudentTouch extends QualityAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 21;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 5;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 70;
    }

    getIds(): number[] {
        return [100227, 100228, 100229, 100230, 100231, 100232, 100233, 100234];
    }

    getPotency(simulation: Simulation): number {
        return 100;
    }
}
