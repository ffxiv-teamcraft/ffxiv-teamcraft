import {BuffAction} from '../buff-action';
import {Buff} from '../../buff.enum';
import {Simulation} from '../../../simulation/simulation';

export class InnerQuiet extends BuffAction {

    protected getBuff(): Buff {
        return Buff.INNER_QUIET;
    }

    canBeUsed(simulationState: Simulation): boolean {
        // You can't use IQ if it's already there
        return super.canBeUsed(simulationState) && !simulationState.hasBuff(this.getBuff());
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 18;
    }

    getDuration(simulation: Simulation): number {
        return Infinity;
    }

    getIds(): number[] {
        return [252, 253, 254, 255, 256, 257, 258, 259];
    }

    protected getInitialStacks(): number {
        return 1;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }
}
