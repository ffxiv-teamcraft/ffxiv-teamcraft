import {Simulation} from '../../simulation/simulation';

export abstract class CraftingAction {

    abstract getIds(): number[];

    abstract getSuccessRate(simulationState: Simulation): number;

    abstract canBeUsed(simulationState: Simulation): boolean;

    abstract getCPCost(simulationState: Simulation): number;

    abstract getDurabilityCost(simulationState: Simulation): number;

    abstract execute(simulation: Simulation): void;
}
