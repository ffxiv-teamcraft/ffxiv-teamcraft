import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class Ingenuity extends BuffAction {

    protected getOverrides(): Buff[] {
        return super.getOverrides().concat(Buff.INGENUITY_II);
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 24;
    }

    protected getBuff(): Buff {
        return Buff.INGENUITY;
    }

    getDuration(simulation: Simulation): number {
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
