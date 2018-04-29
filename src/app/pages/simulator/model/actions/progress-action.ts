import {Simulation} from '../../simulation/simulation';
import {GeneralAction} from './general-action';
import {CrafterStats} from '../crafter-stats';
import {Tables} from '../tables';
import {ActionType} from './action-type';

export abstract class ProgressAction extends GeneralAction {

    public getType(): ActionType {
        return ActionType.PROGRESSION;
    }

    /**
     * Gets base progression, implementation is from ermad's fork
     * (https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js)
     * @param {Simulation} simulation
     * @returns {number}
     */
    private getBaseProgression(simulation: Simulation): number {
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

    execute(simulation: Simulation): void {
        simulation.progression += Math.floor(this.getBaseProgression(simulation) * this.getPotency(simulation) / 100);
    }
}
