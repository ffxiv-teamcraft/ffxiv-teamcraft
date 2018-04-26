import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class MakersMark extends BuffAction {

    getBaseCPCost(simulationState: Simulation): number {
        return 20;
    }

    protected getBuff(): Buff {
        return Buff.MAKERS_MARK;
    }

    protected getDuration(simulation: Simulation): number {
        return Math.round(simulation.recipe.progress / 100);
    }

    getIds(): number[] {
        return [100178];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    canBeUsed(simulation: Simulation): boolean {
        return super.canBeUsed(simulation) && simulation.steps.length === 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }


}
