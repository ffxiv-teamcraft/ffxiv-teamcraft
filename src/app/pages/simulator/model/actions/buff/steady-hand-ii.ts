import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class SteadyHandII extends BuffAction {

    protected getBuff(): Buff {
        return Buff.STEADY_HAND_II;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 25;
    }

    protected getDuration(simulation: Simulation): number {
        return 5;
    }

    getIds(): number[] {
        return [281];
    }

    protected getInitialStacks(): number {
        return 5;
    }

    // Steady hand has no tick.
    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }


}
