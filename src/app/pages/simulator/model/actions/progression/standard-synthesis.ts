import {ProgressAction} from '../progress-action';
import {Simulation} from '../../../simulation/simulation';

export class StandardSynthesis extends ProgressAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 15;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 90;
    }

    getIds(): number[] {
        return [100007, 100021, 100037, 100051, 100067, 100080, 100096, 100111];
    }

    getPotency(): number {
        return 150;
    }

}
