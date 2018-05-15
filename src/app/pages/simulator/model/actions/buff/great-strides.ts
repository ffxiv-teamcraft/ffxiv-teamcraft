import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class GreatStrides extends BuffAction {

    getBaseCPCost(simulationState: Simulation): number {
        return 32;
    }

    protected getBuff(): Buff {
        return Buff.GREAT_STRIDES;
    }

    getDuration(simulation: Simulation): number {
        return 3;
    }

    getIds(): number[] {
        return [260, 261, 262, 263, 264, 265, 266, 267];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }

}
