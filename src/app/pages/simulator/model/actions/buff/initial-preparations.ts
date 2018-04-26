import {BuffAction} from '../buff-action';
import {Buff} from '../../buff.enum';
import {Simulation} from '../../../simulation/simulation';

export class InitialPreparations extends BuffAction {

    protected getBuff(): Buff {
        return Buff.INITIAL_PREPARATIONS;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 50;
    }

    protected getDuration(simulation: Simulation): number {
        return Infinity;
    }

    getIds(): number[] {
        return [10251, 10252, 10253, 10254, 10255, 10256, 10257, 10258];
    }

    canBeUsed(simulation: Simulation): boolean {
        // Can only be used at first turn
        return super.canBeUsed(simulation) && simulation.steps.length === 0;
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }

}
