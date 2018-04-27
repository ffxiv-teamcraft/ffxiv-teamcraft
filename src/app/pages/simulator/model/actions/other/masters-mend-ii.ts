import {CraftingAction} from '../crafting-action';
import {Simulation} from '../../../simulation/simulation';

export class MastersMendII extends CraftingAction {

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    execute(simulation: Simulation): void {
        simulation.repair(60);
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 160;
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getIds(): number[] {
        return [100005, 100019, 100035, 100049, 100065, 100079, 100094, 100110];
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }
}
