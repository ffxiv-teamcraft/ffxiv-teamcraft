import {Simulation} from '../../simulation/simulation';
import {Buff} from '../buff.enum';

export abstract class CraftingAction {

    abstract getIds(): number[];

    abstract getSuccessRate(simulationState: Simulation): number;

    abstract canBeUsed(simulationState: Simulation): boolean;

    public getCPCost(simulationState: Simulation): number {
        const baseCPCost = this.getBaseCPCost(simulationState);
        if (simulationState.hasBuff(Buff.INITIAL_PREPARATIONS)) {
            // According to this reddit topic:
            // https://www.reddit.com/r/ffxiv/comments/7s4ilp/advanced_crafting_theory_and_math_recipe_level/
            // Initial preparation has 20% chances to proc and applies a 30% reduction to CP cost, let's reflect that here.
            const roll = Math.random() * 100;
            if (roll <= 20) {
                return Math.floor(baseCPCost * 0.7);
            }
        }
        return baseCPCost;
    }

    abstract getBaseCPCost(simulationState: Simulation): number;

    abstract getDurabilityCost(simulationState: Simulation): number;

    abstract execute(simulation: Simulation): void;
}
