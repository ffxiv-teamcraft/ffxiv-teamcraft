import {Simulation} from '../../simulation/simulation';
import {GeneralAction} from './general-action';
import {CrafterStats} from '../crafter-stats';
import {Buff} from '../buff.enum';
import {Tables} from '../tables';

export abstract class ProgressAction extends GeneralAction {
    /**
     * Gets base progression, implementation is from ermad's fork
     * (https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js)
     * @param {Simulation} simulation
     * @returns {number}
     */
    private getBaseProgression(simulation: Simulation): number {
        let recipeLevel = simulation.recipe.rlvl;
        const stats: CrafterStats = simulation.crafterStats;
        const crafterLevel = Tables.LEVEL_TABLE[stats.level] || stats.level;
        // If ingenuity
        if (simulation.hasBuff(Buff.INGENUITY)) {
            recipeLevel = Tables.INGENUITY_RLVL_TABLE[simulation.recipe.rlvl] || simulation.recipe.rlvl - 5;
        } else if (simulation.hasBuff(Buff.INGENUITY_II)) {
            recipeLevel = Tables.INGENUITY_II_RLVL_TABLE[simulation.recipe.rlvl] || simulation.recipe.rlvl - 5;
        }
        const levelDifference = Math.max(crafterLevel - recipeLevel, -6);
        let baseProgress = 0;
        let levelCorrectionFactor = 0;
        let recipeLevelPenalty = 0;

        if (crafterLevel > 60) {
            baseProgress = 1.834712812e-5 * stats.craftsmanship * stats.craftsmanship + 1.904074773e-1 * stats.craftsmanship + 1.544103837;
        } else if (crafterLevel > 50) {
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

    execute(simulation: Simulation): void {
        simulation.progression += Math.round(this.getBaseProgression(simulation) * this.getPotency() / 100);
    }
}
