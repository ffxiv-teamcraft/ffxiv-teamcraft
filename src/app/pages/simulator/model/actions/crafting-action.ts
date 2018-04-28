import {Simulation} from '../../simulation/simulation';
import {Buff} from '../buff.enum';
import {ActionType} from './action-type';

/**
 * This is the parent class of all actions in the simulator.
 */
export abstract class CraftingAction {

    abstract getType(): ActionType;

    abstract getIds(): number[];

    abstract getSuccessRate(simulationState: Simulation): number;

    abstract canBeUsed(simulationState: Simulation, linear?: boolean): boolean;

    public getCPCost(simulationState: Simulation, linear = false): number {
        const baseCPCost = this.getBaseCPCost(simulationState);
        if (simulationState.hasBuff(Buff.INITIAL_PREPARATIONS)) {
            // According to this reddit topic:
            // https://www.reddit.com/r/ffxiv/comments/7s4ilp/advanced_crafting_theory_and_math_recipe_level/
            // Initial preparation has 20% chances to proc and applies a 30% reduction to CP cost, let's reflect that here.
            const roll = linear ? 101 : Math.random() * 100;
            if (roll <= 20) {
                return Math.floor(baseCPCost * 0.7);
            }
        }
        return baseCPCost;
    }

    abstract getBaseCPCost(simulationState: Simulation): number;

    abstract getDurabilityCost(simulationState: Simulation): number;

    abstract execute(simulation: Simulation): void;

    public onFail(simulation: Simulation): void {
        // Base onFail does nothing, override to implement it, as it wont be used in most cases.
    }

    public getName(): string {
        return this.constructor.name;
    }
}
