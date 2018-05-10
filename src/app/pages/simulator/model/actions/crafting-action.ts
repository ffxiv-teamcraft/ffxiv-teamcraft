import {Simulation} from '../../simulation/simulation';
import {Buff} from '../buff.enum';
import {ActionType} from './action-type';
import {Tables} from '../tables';
import {CrafterStats} from '../crafter-stats';

/**
 * This is the parent class of all actions in the simulator.
 */
export abstract class CraftingAction {

    /**
     * checks if the action can be moved inside the simulation state,
     * this is meant to prevent moving automatic actions (looking at you Whistle end progression tick).
     * @returns {boolean}
     */
    public canBeMoved(): boolean {
        return true;
    }

    public getId(jobId: number): number {
        // Crafter ids are 8 to 15, we want indexes from 0 to 7, so...
        return this.getIds()[jobId - 8] || this.getIds()[0];
    }

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

    /**
     * Gets base progression, implementation is from ermad's fork
     * (https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js)
     * @param {Simulation} simulation
     * @returns {number}
     */
    protected getBaseProgression(simulation: Simulation): number {
        const recipeLevel = simulation.recipe.rlvl;
        const stats: CrafterStats = simulation.crafterStats;
        const crafterLevel = Tables.LEVEL_TABLE[stats.level] || stats.level;
        const levelDifference = this.getLevelDifference(simulation);
        let baseProgress = 0;
        let levelCorrectionFactor = 0;
        let recipeLevelPenalty = 0;
        if (crafterLevel > 250) {
            baseProgress = 1.834712812e-5 * stats.craftsmanship * stats.craftsmanship + 1.904074773e-1 * stats.craftsmanship + 1.544103837;
        } else if (crafterLevel > 110) {
            baseProgress = 2.09860e-5 * stats.craftsmanship * stats.craftsmanship + 0.196184 * stats.craftsmanship + 2.68452;
        } else {
            baseProgress = 0.214959 * stats.craftsmanship + 1.6;
        }

        // Level boost for recipes below crafter level
        if (levelDifference > 0) {
            levelCorrectionFactor += (0.25 / 5) * Math.min(levelDifference, 5);
        }
        if (levelDifference > 5) {
            levelCorrectionFactor += (0.10 / 5) * Math.min(levelDifference - 5, 10);
        }
        if (levelDifference > 15) {
            levelCorrectionFactor += (0.05 / 5) * Math.min(levelDifference - 15, 5);
        }
        if (levelDifference > 20) {
            levelCorrectionFactor += 0.0006 * (levelDifference - 20);
        }

        // Level penalty for recipes above crafter level
        if (levelDifference < 0) {
            levelCorrectionFactor += 0.025 * Math.max(levelDifference, -10);
            if (Tables.PROGRESS_PENALTY_TABLE[recipeLevel] !== undefined) {
                recipeLevelPenalty += Tables.PROGRESS_PENALTY_TABLE[recipeLevel];
            }
        }

        // Level factor is rounded to nearest percent
        levelCorrectionFactor = Math.round(levelCorrectionFactor * 100) / 100;

        return baseProgress * (1 + levelCorrectionFactor) * (1 + recipeLevelPenalty);
    }


    protected getBaseQuality(simulation: Simulation): number {
        const recipeLevel = simulation.recipe.rlvl;
        const stats: CrafterStats = simulation.crafterStats;
        let recipeLevelPenalty = 0;
        let levelCorrectionFactor = 0;
        const levelDifference = this.getLevelDifference(simulation);

        const baseQuality = 3.46e-5 * stats.getControl(simulation) * stats.getControl(simulation)
            + 0.3514 * stats.getControl(simulation)
            + 34.66;

        if (recipeLevel > 50) {
            // Starts at base penalty amount depending on recipe tier
            let recipeLevelPenaltyLevel = 0;
            Object.keys(Tables.QUALITY_PENALTY_TABLE)
                .forEach((key) => {
                    const penaltyLevel = +key;
                    const penaltyValue = Tables.QUALITY_PENALTY_TABLE[penaltyLevel];
                    if (recipeLevel >= penaltyLevel && penaltyLevel >= recipeLevelPenaltyLevel) {
                        recipeLevelPenalty = penaltyValue;
                        recipeLevelPenaltyLevel = penaltyLevel;
                    }
                });
            // Smaller penalty applied for additional recipe levels within the tier
            recipeLevelPenalty += (recipeLevel - recipeLevelPenaltyLevel) * -0.0002;
        } else {
            recipeLevelPenalty += recipeLevel * -0.00015 + 0.005;
        }

        // Level penalty for recipes above crafter level
        if (levelDifference < 0) {
            levelCorrectionFactor = 0.05 * Math.max(levelDifference, -10);
        }
        return baseQuality * (1 + levelCorrectionFactor) * (1 + recipeLevelPenalty);
    }
}
