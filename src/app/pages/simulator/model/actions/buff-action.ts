import {CraftingAction} from './crafting-action';
import {Simulation} from '../../simulation/simulation';
import {EffectiveBuff} from '../effective-buff';
import {Buff} from '../buff.enum';
import {ActionType} from './action-type';

export abstract class BuffAction extends CraftingAction {

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
        if (simulation.hasBuff(this.getBuff())) {
            simulation.removeBuff(this.getBuff());
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
