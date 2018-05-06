import {CraftingAction} from '../crafting-action';
import {Simulation} from '../../../simulation/simulation';
import {ActionType} from '../action-type';

export class TricksOfTheTrade extends CraftingAction {

    public getType(): ActionType {
        return ActionType.CP_RECOVERY;
    }

    canBeUsed(simulationState: Simulation, linear = false): boolean {
        if (linear) {
            return true
        }
        return simulationState.state === 'GOOD' || simulationState.state === 'EXCELLENT';
    }

    execute(simulation: Simulation): void {
        simulation.availableCP += 20;
        if (simulation.availableCP > simulation.maxCP) {
            simulation.availableCP = simulation.maxCP;
        }
    }

    getBaseCPCost(simulationState: Simulation): number {
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
