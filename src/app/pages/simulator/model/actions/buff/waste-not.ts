import {BuffAction} from '../buff-action';
import {Buff} from '../../buff.enum';
import {Simulation} from '../../../simulation/simulation';

export class WasteNot extends BuffAction {

    protected getBuff(): Buff {
        return Buff.WASTE_NOT;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 56;
    }

    protected getDuration(simulation: Simulation): number {
        return 4;
    }

    getIds(): number[] {
        return [279];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }

}
