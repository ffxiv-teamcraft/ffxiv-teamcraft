import { Simulation } from '../../simulation/simulation';
import { Buff } from '../buff.enum';
import { ActionType } from './action-type';
import { Tables } from '../tables';
import { CrafterStats } from '../crafter-stats';
import { CraftingJob } from '../crafting-job.enum';
import { progressFormulas } from '../formulas/progress-formulas';
import { qualityFormulas } from '../formulas/quality-formulas';
import { ingenuityData } from '../formulas/ingenuity-data';
import { SimulationFailCause } from '../simulation-fail-cause.enum';
import { Class, Instantiable } from '@kaiu/serializer';

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

  public getWaitDuration(): number {
    return this.getType() === ActionType.BUFF ? 2 : 3;
  }

  abstract getLevelRequirement(): { job: CraftingJob, level: number };

  abstract getType(): ActionType;

  abstract getIds(): number[];

  abstract getSuccessRate(simulationState: Simulation): number;

  canBeUsed(simulationState: Simulation, linear?: boolean, safeMode?: boolean): boolean {
    const levelRequirement = this.getLevelRequirement();
    if (safeMode && this.getSuccessRate(simulationState) < 100) {
      return false;
    }
    if (levelRequirement.job !== CraftingJob.ANY && simulationState.crafterStats.levels[levelRequirement.job] !== undefined) {
      return simulationState.crafterStats.levels[levelRequirement.job] >= levelRequirement.level
        && this._canBeUsed(simulationState, linear);
    }
    return simulationState.crafterStats.level >= levelRequirement.level && this._canBeUsed(simulationState, linear);
  }

  getFailCause(simulationState: Simulation, linear?: boolean, safeMode?: boolean): SimulationFailCause {
    const levelRequirement = this.getLevelRequirement();
    if (safeMode && this.getSuccessRate(simulationState) < 100) {
      return SimulationFailCause.UNSAFE_ACTION;
    }
    if (levelRequirement.job !== CraftingJob.ANY && simulationState.crafterStats.levels[levelRequirement.job] !== undefined) {
      if (simulationState.crafterStats.levels[levelRequirement.job] < levelRequirement.level) {
        return SimulationFailCause.MISSING_LEVEL_REQUIREMENT;
      }
    }
    if (simulationState.crafterStats.level < levelRequirement.level) {
      return SimulationFailCause.MISSING_LEVEL_REQUIREMENT;
    }
  }

  abstract _canBeUsed(simulationState: Simulation, linear?: boolean): boolean;

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

  protected getBaseProgression(simulation: Simulation): number {
    const stats = simulation.crafterStats;
    const crafterLevel = Tables.LEVEL_TABLE[stats.level] || stats.level;
    const formula = progressFormulas.find(entry => entry.CharLevel === crafterLevel && entry.RecipeLevel === simulation.recipe.rlvl);
    // If we don't have a formula for this combination, fallback.
    if (formula === undefined) {
      return this.getBaseProgressionFallback(simulation);
    }
    const craftsmanship = simulation.crafterStats.craftsmanship;
    let result = craftsmanship * craftsmanship * formula.Ax2 + craftsmanship * formula.Bx + formula.C;
    if (simulation.hasBuff(Buff.INGENUITY)) {
      result *= this.getIngenuityMultiplier(crafterLevel, simulation.recipe.rlvl, 'Progress', 1);
    } else if (simulation.hasBuff(Buff.INGENUITY_II)) {
      result *= this.getIngenuityMultiplier(crafterLevel, simulation.recipe.rlvl, 'Progress', 2);
    }
    return result;
  }

  protected getIngenuityMultiplier(clvl: number, rlvl: number, type: 'Quality' | 'Progress', level: 1 | 2): number {
    let id = clvl - rlvl;
    let ingenuityEntry = ingenuityData.find(row => row.Id === id);
    let ingenuityMultiplier = ingenuityEntry === undefined ? undefined : ingenuityEntry[`${type}Ingenuity${level}`];
    let tries = 0;
    while (ingenuityMultiplier === null || ingenuityMultiplier === undefined && tries < 100) {
      tries++;
      id > 0 ? id++ : id--;
      ingenuityEntry = ingenuityData.find(row => row.Id === id);
      ingenuityMultiplier = ingenuityEntry === undefined ? undefined : ingenuityEntry[`${type}Ingenuity${level}`];
    }
    // If we tried too many times, just return 1, we don't have ingenuity data for that.
    if (tries >= 100) {
      ingenuityMultiplier = 1.0;
    }
    return ingenuityMultiplier;
  }

  /**
   * Gets base progression, implementation is from ermad's fork
   * (https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js)
   * @param {Simulation} simulation
   * @returns {number}
   */
  protected getBaseProgressionFallback(simulation: Simulation): number {
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
    const stats = simulation.crafterStats;
    const crafterLevel = Tables.LEVEL_TABLE[stats.level] || stats.level;
    const formula = qualityFormulas.find(entry => entry.CharLevel === crafterLevel && entry.RecipeLevel === simulation.recipe.rlvl);
    // If we don't have a formula for this combination, fallback.
    if (formula === undefined) {
      return this.getBaseQualityFallback(simulation);
    }
    const control = simulation.crafterStats.getControl(simulation);
    let result = control * control * formula.Ax2 + control * formula.Bx + formula.C;
    if (simulation.hasBuff(Buff.INGENUITY)) {
      result *= this.getIngenuityMultiplier(crafterLevel, simulation.recipe.rlvl, 'Quality', 1);
    } else if (simulation.hasBuff(Buff.INGENUITY_II)) {
      result *= this.getIngenuityMultiplier(crafterLevel, simulation.recipe.rlvl, 'Quality', 2);
    }
    return result;
  }

  protected getBaseQualityFallback(simulation: Simulation): number {
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

  /**
   * Checks if this action is an instance of a given other action.
   * @param actionClass
   */
  is(actionClass: Class<CraftingAction>): boolean {
    return this instanceof actionClass;
  }
}
