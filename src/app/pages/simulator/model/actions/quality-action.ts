import {Simulation} from '../../simulation/simulation';
import {GeneralAction} from './general-action';
import {CrafterStats} from '../crafter-stats';
import {Tables} from '../tables';
import {Buff} from '../buff.enum';
import {ActionType} from './action-type';

export abstract class QualityAction extends GeneralAction {

    public getType(): ActionType {
        return ActionType.QUALITY;
    }

    private getBaseQuality(simulation: Simulation): number {
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

    execute(simulation: Simulation, skipStackAddition = false): void {
        let qualityIncrease = this.getBaseQuality(simulation) * this.getPotency(simulation) / 100;
        switch (simulation.state) {
            case 'EXCELLENT':
                qualityIncrease *= 4;
                break;
            case 'POOR':
                qualityIncrease *= 0.5;
                break;
            case 'GOOD':
                qualityIncrease *= 1.5;
                break;
            default:
                break;
        }
        if (simulation.hasBuff(Buff.GREAT_STRIDES)) {
            qualityIncrease *= 2;
            simulation.removeBuff(Buff.GREAT_STRIDES);
        }
        simulation.quality += Math.ceil(qualityIncrease);
        if (simulation.hasBuff(Buff.INNER_QUIET) && simulation.getBuff(Buff.INNER_QUIET).stacks < 11 && !skipStackAddition) {
            simulation.getBuff(Buff.INNER_QUIET).stacks++;
        }
    }

}
