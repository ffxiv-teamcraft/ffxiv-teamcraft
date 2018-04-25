import {CraftingAction} from './crafting-action';
import {Simulation} from '../../simulation/simulation';
import {EffectiveBuff} from '../effective-buff';
import {Buff} from '../buff.enum';

export abstract class BuffAction extends CraftingAction {

    private getAppliedBuff(): EffectiveBuff {
        return {
            duration: this.getDuration(),
            tick: this.getTick(),
            stacks: this.getInitialStacks(),
            buff: this.getBuff()
        }
    }

    protected abstract getDuration(): number;

    protected abstract getBuff(): Buff;

    protected abstract getInitialStacks(): number;

    protected abstract getTick(): (simulation: Simulation) => void;

    execute(simulation: Simulation): void {
        simulation.buffs.push(this.getAppliedBuff());
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
