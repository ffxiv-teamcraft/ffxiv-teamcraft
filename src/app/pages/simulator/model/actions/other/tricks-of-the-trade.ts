import {CraftingAction} from '../crafting-action';
import {Simulation} from '../../../simulation/simulation';

export class TricksOfTheTrade extends CraftingAction {

    canBeUsed(simulationState: Simulation): boolean {
        return simulationState.state === 'GOOD' || simulationState.state === 'EXCELLENT';
    }

    execute(simulation: Simulation): void {
        simulation.availableCP += 20;
        if (simulation.availableCP > simulation.maxCP) {
            simulation.availableCP = simulation.maxCP;
        }
    }

    getCPCost(simulationState: Simulation): number {
        return 0;
    }

    getIds(): number[] {
        return [100098];
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

}
