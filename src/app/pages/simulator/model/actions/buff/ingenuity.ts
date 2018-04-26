import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class Ingenuity extends BuffAction {

    getBaseCPCost(simulationState: Simulation): number {
        return 24;
    }

    protected getBuff(): Buff {
        return Buff.INGENUITY;
    }

    protected getDuration(simulation: Simulation): number {
        return 5;
    }

    getIds(): number[] {
        return [277];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }
}
