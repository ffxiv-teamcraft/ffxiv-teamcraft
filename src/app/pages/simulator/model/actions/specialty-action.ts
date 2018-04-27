import {CraftingAction} from './crafting-action';
import {Simulation} from '../../simulation/simulation';
import {Buff} from '../buff.enum';

/**
 * SpecialtyAction is for the three R's, the actions that stop Initial preparation and add an effect.
 */
export abstract class SpecialtyAction extends CraftingAction {

    canBeUsed(simulationState: Simulation): boolean {
        return simulationState.hasBuff(Buff.INITIAL_PREPARATIONS) && simulationState.crafterStats.specialist;
    }

    execute(simulation: Simulation): void {
        this.applyReflect(simulation);
        simulation.removeBuff(Buff.INITIAL_PREPARATIONS);
    }

    abstract applyReflect(simulation: Simulation): void;

    getBaseCPCost(simulationState: Simulation): number {
        return 0;
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }

}
