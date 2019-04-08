import { Craft } from '../../../model/garland-tools/craft';
import { CraftingAction } from '../model/actions/crafting-action';
import { ActionResult } from '../model/action-result';
import { CrafterStats } from '../model/crafter-stats';
import { EffectiveBuff } from '../model/effective-buff';
import { Buff } from '../model/buff.enum';
import { SimulationResult } from './simulation-result';
import { SimulationReliabilityReport } from './simulation-reliability-report';
import { Tables } from '../model/tables';
import { Reclaim } from '../model/actions/buff/reclaim';
import { SimulationFailCause } from '../model/simulation-fail-cause.enum';

export class Simulation {

  public progression = 0;
  public quality = 0;
  public startingQuality = 0;
  // Durability of the craft
  public durability: number;

  public state: 'NORMAL' | 'EXCELLENT' | 'GOOD' | 'POOR';

  public availableCP: number;
  public maxCP: number;

  public buffs: EffectiveBuff[] = [];

  public success: boolean;

  public steps: ActionResult[] = [];

  public lastPossibleReclaimStep: number; // equals the index of the last step where you have CP/durability for Reclaim,
                                          // or -1 if Reclaim is uncastable (i.e. not enough CP)

  public safe = false;

  constructor(public readonly recipe: Craft, public actions: CraftingAction[], private _crafterStats: CrafterStats,
              private hqIngredients: { id: number, amount: number }[] = []) {
    this.durability = recipe.durability;
    this.availableCP = this._crafterStats.cp;
    this.maxCP = this.availableCP;
    for (const ingredient of this.hqIngredients) {
      // Get the ingredient in the recipe
      const ingredientDetails = this.recipe.ingredients.find(i => i.id === ingredient.id);
      // Check that the ingredient in included in the recipe
      if (ingredientDetails !== undefined) {
        this.quality += ingredientDetails.quality * ingredient.amount;
      }
    }
    this.startingQuality = this.quality;
  }

  public get lastStep(): ActionResult {
    return this.steps[this.steps.length - 1];
  }

  public get crafterStats(): CrafterStats {
    return this._crafterStats;
  }

  public getReliabilityReport(): SimulationReliabilityReport {
    this.reset();
    const results: SimulationResult[] = [];
    // Let's run the simulation 200 times.
    for (let i = 0; i < 200; i++) {
      results.push(this.run(false));
      this.reset();
    }
    const successPercent = (results.filter(res => res.success).length / results.length) * 100;
    const hqPercent = results.reduce((p, c) => p + c.hqPercent, 0) / results.length;
    let hqMedian = 0;
    results.map(res => res.hqPercent).sort((a, b) => a - b);
    if (results.length % 2) {
      hqMedian = results[results.length / 2].hqPercent;
    } else {
      hqMedian = (results[Math.floor(results.length / 2)].hqPercent + results[Math.ceil(results.length / 2)].hqPercent) / 2;
    }
    return {
      rawData: results,
      successPercent: Math.round(successPercent),
      averageHQPercent: Math.round(hqPercent),
      medianHQPercent: hqMedian
    };
  }

  public getMinStats(): { control: number, craftsmanship: number, cp: number } {
    const originalHqPercent = this.run(true).hqPercent;
    // Three loops, one per stat
    while (this.run(true).success) {
      this.crafterStats.craftsmanship--;
      this.reset();
    }
    this.crafterStats.craftsmanship++;
    while (this.run(true).hqPercent >= originalHqPercent && originalHqPercent > 1 && this.crafterStats._control > 0) {
      this.crafterStats._control--;
      this.reset();
    }
    this.crafterStats._control++;
    while (this.run(true).success) {
      this.crafterStats.cp--;
      this.reset();
    }
    this.crafterStats.cp++;
    return {
      control: this.crafterStats._control,
      craftsmanship: this.crafterStats.craftsmanship,
      cp: this.crafterStats.cp
    };
  }

  public reset(): void {
    delete this.success;
    this.progression = 0;
    this.durability = this.recipe.durability;
    this.quality = this.startingQuality;
    this.buffs = [];
    this.steps = [];
    this.maxCP = this.crafterStats.cp;
    this.availableCP = this.maxCP;
    this.state = 'NORMAL';
    this.safe = false;
  }

  /**
   * Run the simulation.
   * @param {boolean} linear should everything be linear (aka no fail on actions, Initial preparations never procs)
   * @param maxTurns
   * @param safeMode Safe mode makes all the actions that have success chances < 100
   * @returns {ActionResult[]}
   */
  public run(linear = false, maxTurns = Infinity, safeMode = false): SimulationResult {
    this.lastPossibleReclaimStep = -1;
    const reclaimAction = new Reclaim();
    this.actions.filter(a => a !== undefined).forEach((action: CraftingAction, index: number) => {
      // If we're starting and the crafter is specialist
      if (index === 0 && this.crafterStats.specialist && this.crafterStats.level >= 70) {
        // Push stroke of genius buff
        this.buffs.push({
          buff: Buff.STROKE_OF_GENIUS,
          stacks: 0,
          duration: Infinity,
          appliedStep: -1
        });
        // Apply stroke of genius manually in the stats
        this.availableCP += 15;
        this.maxCP += 15;
      }
      let result: ActionResult;
      let failCause: SimulationFailCause;
      const canUseAction = action.canBeUsed(this, linear);
      if (!canUseAction) {
        failCause = action.getFailCause(this, linear, safeMode);
      }
      const hasEnoughCP = action.getBaseCPCost(this) <= this.availableCP;
      if (!hasEnoughCP) {
        failCause = SimulationFailCause.NOT_ENOUGH_CP;
      }
      // If we can use the action
      if (this.success === undefined && hasEnoughCP && this.steps.length < maxTurns && canUseAction) {
        result = this.runAction(action, linear, safeMode);
        if (reclaimAction.getBaseCPCost(this) <= this.availableCP && reclaimAction.canBeUsed(this, linear)) {
          this.lastPossibleReclaimStep = index;
        }
      } else {
        // If we can't, add the step to the result but skip it.
        result = {
          action: action,
          success: null,
          addedQuality: 0,
          addedProgression: 0,
          cpDifference: 0,
          skipped: true,
          solidityDifference: 0,
          state: this.state,
          failCause: failCause
        };
      }
      if (this.steps.length <= maxTurns) {
        const qualityBefore = this.quality;
        const progressionBefore = this.progression;
        const durabilityBefore = this.durability;
        const cpBefore = this.availableCP;
        // Tick buffs after checking synth result, so if we reach 0 durability, synth fails.
        this.tickBuffs(linear);
        result.afterBuffTick = {
          // Amount of progression added to the craft
          addedProgression: this.progression - progressionBefore,
          // Amount of quality added to the craft
          addedQuality: this.quality - qualityBefore,
          // CP added to the craft (negative if removed)
          cpDifference: this.availableCP - cpBefore,
          // Solidity added to the craft (negative if removed)
          solidityDifference: this.durability - durabilityBefore
        };
      }
      // Tick state to change it for next turn if not in linear mode
      if (!linear) {
        this.tickState();
      }

      this.steps.push(result);
    });
    // HQ percent to quality percent formulae: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1455

    const failedAction = this.steps.find(step => step.failCause !== undefined);
    const res: SimulationResult = {
      steps: this.steps,
      hqPercent: this.getHQPercent(),
      success: this.progression >= this.recipe.progress,
      simulation: this
    };
    if (failedAction !== undefined) {
      res.failCause = SimulationFailCause[failedAction.failCause];
    }
    return res;
  }

  /**
   * Runs an action, can be called from external class (Whistle for instance).
   * @param {CraftingAction} action
   * @param {boolean} linear
   * @param {boolean} safeMode
   */
  public runAction(action: CraftingAction, linear = false, safeMode = false): ActionResult {
    // The roll for the current action's success rate, 0 if ideal mode, as 0 will even match a 1% chances.
    const probabilityRoll = linear ? 0 : Math.random() * 100;
    const qualityBefore = this.quality;
    const progressionBefore = this.progression;
    const durabilityBefore = this.durability;
    const cpBefore = this.availableCP;
    let failCause: SimulationFailCause;
    let success = false;
    if (safeMode && action.getSuccessRate(this) < 100) {
      failCause = SimulationFailCause.UNSAFE_ACTION;
      action.onFail(this);
      this.safe = false;
    } else {
      if (action.getSuccessRate(this) >= probabilityRoll) {
        action.execute(this);
        success = true;
      } else {
        action.onFail(this);
      }
    }

    // Even if the action failed, we have to remove the durability cost
    this.durability -= action.getDurabilityCost(this);
    // Even if the action failed, CP has to be consumed too
    this.availableCP -= action.getCPCost(this, linear);
    if (this.progression >= this.recipe.progress) {
      this.success = true;
    } else if (this.durability <= 0) {
      failCause = SimulationFailCause.DURABILITY_REACHED_ZERO;
      // Check durability to see if the craft is failed or not
      this.success = false;
    }
    // return action result
    return {
      action: action,
      success: success,
      addedQuality: this.quality - qualityBefore,
      addedProgression: this.progression - progressionBefore,
      cpDifference: this.availableCP - cpBefore,
      skipped: false,
      solidityDifference: this.durability - durabilityBefore,
      state: this.state,
      failCause: failCause
    };
  }

  public hasBuff(buff: Buff): boolean {
    return this.buffs.find(row => row.buff === buff) !== undefined;
  }

  public getBuff(buff: Buff): EffectiveBuff {
    return this.buffs.find(row => row.buff === buff);
  }

  public removeBuff(buff: Buff): void {
    this.buffs = this.buffs.filter(row => row.buff !== buff);
  }

  public repair(amount: number): void {
    this.durability += amount;
    if (this.durability > this.recipe.durability) {
      this.durability = this.recipe.durability;
    }
  }

  private getHQPercent(): number {
    const qualityPercent = Math.min(this.quality / this.recipe.quality, 1) * 100;
    if (qualityPercent === 0) {
      return 1;
    } else if (qualityPercent >= 100) {
      return 100;
    } else {
      return Tables.HQ_TABLE[Math.floor(qualityPercent)];
    }
  }

  private tickBuffs(linear = false): void {
    for (const effectiveBuff of this.buffs) {
      // We are checking the appliedStep because ticks only happen at the beginning of the second turn after the application,
      // For instance, Great strides launched at turn 1 will start to loose duration at the beginning of turn 3
      if (effectiveBuff.appliedStep < this.steps.length) {
        // If the buff has something to do, let it do it
        if (effectiveBuff.tick !== undefined) {
          effectiveBuff.tick(this, linear);
        }
        effectiveBuff.duration--;
      }
    }
    this.buffs = this.buffs.filter(buff => buff.duration > 0);
  }

  /**
   * Changes the state of the craft,
   * source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L255
   */
  private tickState(): void {
    // If current state is EXCELLENT, then next one is poor
    if (this.state === 'EXCELLENT') {
      this.state = 'POOR';
      return;
    }

    // Good
    const recipeLevel = this.recipe.rlvl;
    const qualityAssurance = this.crafterStats.level >= 63;
    let goodChances = 0;
    if (recipeLevel >= 300) { // 70*+
      goodChances = qualityAssurance ? 0.11 : 0.10;
    } else if (recipeLevel >= 276) { // 65+
      goodChances = qualityAssurance ? 0.17 : 0.15;
    } else if (recipeLevel >= 255) { // 61+
      goodChances = qualityAssurance ? 0.22 : 0.20;
    } else if (recipeLevel >= 150) { // 60+
      goodChances = qualityAssurance ? 0.11 : 0.10;
    } else if (recipeLevel >= 136) { // 55+
      goodChances = qualityAssurance ? 0.17 : 0.15;
    } else {
      goodChances = qualityAssurance ? 0.27 : 0.25;
    }

    // Excellent
    let excellentChances = 0;
    if (recipeLevel >= 300) { // 70*+
      excellentChances = 0.01;
    } else if (recipeLevel >= 255) { // 61+
      excellentChances = 0.02;
    } else if (recipeLevel >= 150) { // 60+
      excellentChances = 0.01;
    } else {
      excellentChances = 0.02;
    }

    const exRandom = Math.random();
    if (exRandom <= excellentChances) {
      this.state = 'EXCELLENT';
    } else {
      const goodRandom = Math.random();
      if (goodRandom <= goodChances) {
        this.state = 'GOOD';
      } else {
        this.state = 'NORMAL';
      }
    }
  }

  clone(): Simulation {
    return new Simulation(this.recipe, this.actions, this.crafterStats, this.hqIngredients);
  }
}
