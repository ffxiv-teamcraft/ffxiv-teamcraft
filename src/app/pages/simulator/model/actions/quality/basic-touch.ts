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

    getBaseCPCost(simulationState: Simulation): number {
        return 0;
    }

    getIds(): number[] {
        return [100002, 100016, 100031, 100046, 100061, 100076, 100091, 100106];
    }

    getPotency(simulation: Simulation): number {
        return 100;
    }

}
