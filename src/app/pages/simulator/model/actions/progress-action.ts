import {Simulation} from '../../simulation/simulation';
import {GeneralAction} from './general-action';
import {CrafterStats} from '../crafter-stats';
import {Buff} from '../buff.enum';

export abstract class ProgressAction extends GeneralAction {

    // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1823
    private static readonly LEVEL_TABLE = {
        51: 120, // 120
        52: 125, // 125
        53: 130, // 130
        54: 133, // 133
        55: 136, // 136
        56: 139, // 139
        57: 142, // 142
        58: 145, // 145
        59: 148, // 148
        60: 150, // 150
        61: 260,
        62: 265,
        63: 270,
        64: 273,
        65: 276,
        66: 279,
        67: 282,
        68: 285,
        69: 288,
        70: 290
    };

    // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1956
    private static readonly PROGRESS_PENALTY_TABLE = {
        180: -0.02,
        210: -0.035,
        220: -0.035,
        250: -0.04,
        320: -0.02,
        350: -0.035,
    };

    // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1846
    private static readonly INGENUITY_RLVL_TABLE = {
        40: 36,
        41: 36,
        42: 37,
        43: 38,
        44: 39,
        45: 40,
        46: 41,
        47: 42,
        48: 43,
        49: 44,
        50: 45,
        55: 50,     // 50_1star     *** unverified
        70: 51,     // 50_2star     *** unverified
        90: 58,     // 50_3star     *** unverified
        110: 59,    // 50_4star     *** unverified
        115: 100,   // 51 @ 169/339 difficulty
        120: 101,   // 51 @ 210/410 difficulty
        125: 102,   // 52
        130: 110,   // 53
        133: 111,   // 54
        136: 112,   // 55
        139: 126,   // 56
        142: 131,   // 57
        145: 134,   // 58
        148: 137,   // 59
        150: 140,   // 60
        160: 151,   // 60_1star
        180: 152,   // 60_2star
        210: 153,   // 60_3star
        220: 153,   // 60_3star
        250: 154,   // 60_4star
        255: 238,   // 61 @ 558/1116 difficulty
        260: 240,   // 61 @ 700/1400 difficulty
        265: 242,   // 62
        270: 250,   // 63
        273: 251,   // 64
        276: 252,   // 65
        279: 266,   // 66
        282: 271,   // 67
        285: 274,   // 68
        288: 277,   // 69
        290: 280,   // 70
        300: 291,   // 70_1star
        320: 292,   // 70_2star
        350: 293,   // 70_3star
    };

    // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1894
    private static readonly INGENUITY_II_RLVL_TABLE = {
        40: 33,
        41: 34,
        42: 35,
        43: 36,
        44: 37,
        45: 38,
        46: 39,
        47: 40,
        48: 40,
        49: 41,
        50: 42,
        55: 47,     // 50_1star     *** unverified
        70: 48,     // 50_2star     *** unverified
        90: 56,     // 50_3star     *** unverified
        110: 57,    // 50_4star     *** unverified
        115: 97,    // 51 @ 169/339 difficulty
        120: 99,    // 51 @ 210/410 difficulty
        125: 101,   // 52
        130: 109,   // 53
        133: 110,   // 54
        136: 111,   // 55
        139: 125,   // 56
        142: 130,   // 57
        145: 133,   // 58
        148: 136,   // 59
        150: 139,   // 60
        160: 150,   // 60_1star
        180: 151,   // 60_2star
        210: 152,   // 60_3star
        220: 152,   // 60_3star
        250: 153,   // 60_4star
        255: 237,   // 61 @ 558/1116 difficulty
        260: 239,   // 61 @ 700/1400 difficulty
        265: 241,   // 62
        270: 249,   // 63
        273: 250,   // 64
        276: 251,   // 65
        279: 265,   // 66
        282: 270,   // 67
        285: 273,   // 68
        288: 276,   // 69
        290: 279,   // 70
        300: 290,   // 70_1star
        320: 291,   // 70_2star
        350: 292,   // 70_3star
    };

    /**
     * Gets base progression, implementation is from ermad's fork
     * (https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js)
     * @param {Simulation} simulation
     * @returns {number}
     */
    private getBaseProgression(simulation: Simulation): number {
        let recipeLevel = simulation.recipe.rlvl;
        const stats: CrafterStats = simulation.crafterStats;
        const crafterLevel = ProgressAction.LEVEL_TABLE[stats.level] || stats.level;
        // If ingenuity
        if (simulation.hasBuff(Buff.INGENUITY)) {
            recipeLevel = ProgressAction.INGENUITY_RLVL_TABLE[simulation.recipe.rlvl] || simulation.recipe.rlvl - 5;
        } else if (simulation.hasBuff(Buff.INGENUITY_II)) {
            recipeLevel = ProgressAction.INGENUITY_II_RLVL_TABLE[simulation.recipe.rlvl] || simulation.recipe.rlvl - 5;
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
            if (ProgressAction.PROGRESS_PENALTY_TABLE[recipeLevel] !== undefined) {
                recipeLevelPenalty += ProgressAction.PROGRESS_PENALTY_TABLE[recipeLevel];
            }
        }

        // Level factor is rounded to nearest percent
        levelCorrectionFactor = Math.floor(levelCorrectionFactor * 100) / 100;

        return baseProgress * (1 + levelCorrectionFactor) * (1 + recipeLevelPenalty);
    }

    execute(simulation: Simulation): void {
        simulation.progression += Math.floor(this.getBaseProgression(simulation) * this.getPotency() / 100);
    }
}
