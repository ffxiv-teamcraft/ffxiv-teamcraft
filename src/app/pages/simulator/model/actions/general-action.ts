import {CraftingAction} from './crafting-action';
import {Simulation} from '../../simulation/simulation';
import {Buff} from '../buff.enum';
import {Tables} from '../tables';
import {CrafterStats} from '../crafter-stats';

/**
 * This is for every progress and quality actions
 */
export abstract class GeneralAction extends CraftingAction {

    protected getLevelDifference(simulation: Simulation): number {
        let recipeLevel = simulation.recipe.rlvl;
        const stats: CrafterStats = simulation.crafterStats;
        const crafterLevel = Tables.LEVEL_TABLE[stats.level] || stats.level;
        let levelDifference = crafterLevel - recipeLevel;
        // If ingenuity 2
        if (simulation.hasBuff(Buff.INGENUITY_II)) {
            recipeLevel = Tables.INGENUITY_II_RLVL_TABLE[simulation.recipe.rlvl] || simulation.recipe.rlvl - 7;
            levelDifference = crafterLevel - recipeLevel;
            if (levelDifference < 0) {
                levelDifference = Math.max(levelDifference, -5);
            }
        }
        // If ingenuity
        if (simulation.hasBuff(Buff.INGENUITY)) {
            recipeLevel = Tables.INGENUITY_RLVL_TABLE[simulation.recipe.rlvl] || simulation.recipe.rlvl - 5;
            levelDifference = crafterLevel - recipeLevel;
            if (levelDifference < 0) {
                levelDifference = Math.max(levelDifference, -6);
            }
        }
        return levelDifference;
    }

    getDurabilityCost(simulationState: Simulation): number {
        const baseCost = this.getBaseDurabilityCost(simulationState);
        if (simulationState.hasBuff(Buff.WASTE_NOT) || simulationState.hasBuff(Buff.WASTE_NOT_II)) {
            return baseCost / 2;
        }
        return baseCost;
    }

    getSuccessRate(simulationState: Simulation): number {
        const baseRate = this.getBaseSuccessRate(simulationState);
        if (simulationState.hasBuff(Buff.STEADY_HAND)) {
            return baseRate + 20;
        }
        if (simulationState.hasBuff(Buff.STEADY_HAND_II)) {
            return baseRate + 30;
        }
        return baseRate;
    }

    abstract getPotency(simulation: Simulation): number;

    abstract getBaseDurabilityCost(simulationState: Simulation): number;

    abstract getBaseSuccessRate(simulationState: Simulation): number;
}
