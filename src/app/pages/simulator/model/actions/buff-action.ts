import {CraftingAction} from './crafting-action';
import {Simulation} from '../../simulation/simulation';
import {EffectiveBuff} from '../effective-buff';

export abstract class BuffAction extends CraftingAction {

    protected abstract getAppliedBuff(simulationState: Simulation): EffectiveBuff;

    execute(simulation: Simulation): void {
        simulation.buffs.push(this.getAppliedBuff(simulation));
    }

    canBeUsed(simulationState: Simulation): boolean {
        // You can't use a buff twice
        return !simulationState.hasBuff(this.getAppliedBuff(simulationState).buff);
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }

}
