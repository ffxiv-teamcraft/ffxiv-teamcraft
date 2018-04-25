import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class SteadyHand extends BuffAction {

    protected getBuff(): Buff {
        return Buff.STEADY_HAND;
    }

    getCPCost(simulationState: Simulation): number {
        return 22;
    }

    protected getDuration(): number {
        return 5;
    }

    getIds(): number[] {
        return [244, 245, 246, 247, 248, 249, 250, 251];
    }

    protected getInitialStacks(): number {
        return 5;
    }

    // Steady hand has no tick.
    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }


}
