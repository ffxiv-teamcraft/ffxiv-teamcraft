import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class SteadyHandII extends BuffAction {

    protected getOverrides(): Buff[] {
        return super.getOverrides().concat(Buff.STEADY_HAND);
    }

    protected getBuff(): Buff {
        return Buff.STEADY_HAND_II;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 25;
    }

    getDuration(simulation: Simulation): number {
        return 5;
    }

    getIds(): number[] {
        return [281];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    // Steady hand has no tick.
    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }

}
