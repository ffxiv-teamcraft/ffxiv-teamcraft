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
        return [10001, 10015, 10030, 10045, 10060, 10075, 10090, 10105];
    }

    getPotency(simulation: Simulation): number {
        return 100;
    }

}
