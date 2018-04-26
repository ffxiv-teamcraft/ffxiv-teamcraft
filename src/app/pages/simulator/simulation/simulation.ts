import {Craft} from '../../../model/garland-tools/craft';
import {CraftingAction} from '../model/actions/crafting-action';
import {ActionResult} from '../model/action-result';
import {CrafterStats} from '../model/crafter-stats';
import {EffectiveBuff} from '../model/effective-buff';
import {Buff} from '../model/buff.enum';

export class Simulation {

    public progression = 0;
    public quality = 0;
    // Solidity of the craft
    public solidity: number;

    public state: 'NORMAL' | 'EXCELLENT' | 'GOOD' | 'POOR';

    public availableCP: number;
    public maxCP: number;

    public buffs: EffectiveBuff[] = [];

    public success: boolean;

    public steps: ActionResult[] = [];

    constructor(public readonly recipe: Craft, private actions: CraftingAction[], private _crafterStats: CrafterStats,
                hqIngredients: { id: number, amount: number }[] = []) {
        this.solidity = recipe.durability;
        this.availableCP = this._crafterStats.cp;
        this.maxCP = this.availableCP;
        for (const ingredient of hqIngredients) {
            // Get the ingredient in the recipe
            const ingredientDetails = this.recipe.ingredients.find(i => i.id === ingredient.id);
            // Check that the ingredient in included in the recipe
            if (ingredientDetails !== undefined) {
                this.quality += ingredientDetails.quality * ingredient.amount;
            }
        }
    }

    public run(): ActionResult[] {
        this.actions.forEach((action: CraftingAction, index: number) => {
            // If we're starting and the crafter is specialist
            if (index === 0 && this.crafterStats.specialist) {
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
            // If we can use the action
            if (this.success === undefined && action.getBaseCPCost(this) <= this.availableCP && action.canBeUsed(this)) {
                // The roll for the current action's success rate
                const probabilityRoll = Math.random() * 100;
                const qualityBefore = this.quality;
                const progressionBefore = this.progression;
                if (action.getSuccessRate(this) >= probabilityRoll) {
                    action.execute(this);
                } else {
                    action.onFail(this);
                }
                // Even if the action failed, we have to remove the durability cost
                this.solidity -= action.getDurabilityCost(this);
                // Even if the action failed, CP has to be consumed too
                this.availableCP -= action.getCPCost(this);
                // Push the result to the result array
                this.steps.push({
                    action: action,
                    success: action.getSuccessRate(this) >= probabilityRoll,
                    addedQuality: this.quality - qualityBefore,
                    addedProgression: this.progression - progressionBefore,
                    cpDifference: action.getCPCost(this),
                    skipped: false,
                    solidityDifference: action.getDurabilityCost(this)
                });
                // Check solidity to see if the craft is failed or not
                if (this.solidity <= 0) {
                    this.success = false;
                }
            } else {
                // If we can't, add the step to the result but skip it.
                this.steps.push({
                    action: action,
                    success: null,
                    addedQuality: 0,
                    addedProgression: 0,
                    cpDifference: 0,
                    skipped: true,
                    solidityDifference: 0
                });
            }
            // Tick buffs after checking synth result, so if we reach 0 solidity, synth fails.
            this.tickBuffs();
        });
        return this.steps;
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

    public get lastStep(): ActionResult {
        return this.steps[this.steps.length - 1];
    }

    private tickBuffs(): void {
        for (const effectiveBuff of this.buffs) {
            // We are checking the appliedStep because ticks only happen at the beginning of the second turn after the application,
            // For instance, Great strides launched at turn 1 will start to loose duration at the beginning of turn 3
            if (effectiveBuff.appliedStep + 1 < this.steps.length) {
                // If the buff has something to do, let it do it
                if (effectiveBuff.tick !== undefined) {
                    effectiveBuff.tick(this);
                }
                effectiveBuff.duration--;
            }
        }
        this.buffs = this.buffs.filter(buff => buff.duration > 0);
    }

    public repair(amount: number): void {
        this.solidity += amount;
        if (this.solidity > this.recipe.durability) {
            this.solidity = this.recipe.durability;
        }
    }

    public get crafterStats(): CrafterStats {
        return this._crafterStats;
    }
}
