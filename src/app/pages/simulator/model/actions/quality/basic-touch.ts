import {QualityAction} from '../quality-action';
import {Simulation} from '../../../simulation/simulation';

export class BasicTouch extends QualityAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 70;
    }

    getCPCost(simulationState: Simulation): number {
        return 0;
    }

    getIds(): number[] {
        return [10002, 10016, 10031, 10046, 10061, 10076, 10091, 10106];
    }

    getPotency(): number {
        return 100;
    }

}
