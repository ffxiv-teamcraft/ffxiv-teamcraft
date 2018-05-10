import {CraftingAction} from './crafting-action';
import {Simulation} from '../../simulation/simulation';
import {EffectiveBuff} from '../effective-buff';
import {Buff} from '../buff.enum';
import {ActionType} from './action-type';

export abstract class BuffAction extends CraftingAction {

    /**
     * Override this method if the buff overrides other buffs (steady hands for instance).
     * Don't forget to add super.getOverrides() to the array you'll return
     * @returns {Buff | null}
     */
    protected getOverrides(): Buff[] {
        return [this.getBuff()];
    }

    public getType(): ActionType {
        return ActionType.BUFF;
    }

    private getAppliedBuff(simulation: Simulation): EffectiveBuff {
        return {
            duration: this.getDuration(simulation),
            tick: this.getTick(),
            stacks: this.getInitialStacks(),
            buff: this.getBuff(),
            appliedStep: simulation.steps.length
        }
    }

    abstract getDuration(simulation: Simulation): number;

    protected abstract getBuff(): Buff;

    protected abstract getInitialStacks(): number;

    protected abstract getTick(): (simulation: Simulation, linear?: boolean) => void;

    execute(simulation: Simulation): void {
        for (const buffToOverride of this.getOverrides()) {
            simulation.removeBuff(buffToOverride);
        }
        simulation.buffs.push(this.getAppliedBuff(simulation));
    }

    canBeUsed(simulationState: Simulation): boolean {
        return true;
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }

}
