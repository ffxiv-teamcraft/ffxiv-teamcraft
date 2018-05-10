import {ProgressAction} from '../progress-action';
import {Simulation} from '../../../simulation/simulation';

export class RapidSynthesisII extends ProgressAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 12;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 60;
    }

    getIds(): number[] {
        return [100211, 100212, 100213, 100214, 100215, 100216, 100217, 100218];
    }

    getPotency(simulation: Simulation): number {
        return 300;
    }

}
