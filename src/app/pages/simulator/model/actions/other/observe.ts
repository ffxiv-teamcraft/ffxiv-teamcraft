import {CraftingAction} from '../crafting-action';
import {Simulation} from '../../../simulation/simulation';

export class Observe extends CraftingAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    execute(simulation: Simulation): void {
        // Nothing happens
    }

    getCPCost(simulationState: Simulation): number {
        return 7;
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getIds(): number[] {
        return [100113];
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }

}
