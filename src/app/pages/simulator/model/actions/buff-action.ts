import {CraftingAction} from './crafting-action';
import {Simulation} from '../../simulation/simulation';
import {EffectiveBuff} from '../effective-buff';
import {Buff} from '../buff.enum';

export abstract class BuffAction extends CraftingAction {

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

    protected abstract getTick(): (simulation: Simulation) => void;

    execute(simulation: Simulation): void {
        simulation.buffs.push(this.getAppliedBuff(simulation));
    }

    canBeUsed(simulationState: Simulation): boolean {
        // You can't use a buff twice
        return !simulationState.hasBuff(this.getBuff());
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }

}
