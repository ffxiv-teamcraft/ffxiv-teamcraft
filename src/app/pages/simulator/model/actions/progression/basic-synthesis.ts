import {ProgressAction} from '../progress-action';
import {Simulation} from '../../../simulation/simulation';

export class BasicSynthesis extends ProgressAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 90;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 0;
    }

    getIds(): number[] {
        return [100001, 100015, 100030, 100045, 100060, 100075, 100090, 100105];
    }

    getPotency(simulation: Simulation): number {
        return 100;
    }

}
