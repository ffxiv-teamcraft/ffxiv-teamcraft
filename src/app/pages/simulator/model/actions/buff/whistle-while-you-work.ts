import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class WhistleWhileYouWork extends BuffAction {

    getBaseCPCost(simulationState: Simulation): number {
        return 36;
    }

    protected getBuff(): Buff {
        return Buff.WHISTLE_WHILE_YOU_WORK;
    }

    getDuration(simulation: Simulation): number {
        return Infinity;
    }

    getIds(): number[] {
        return [];
    }

    protected getInitialStacks(): number {
        return 11;
    }

    protected getTick(): (simulation: Simulation, linear?: boolean) => void {
        return (simulation, linear) => {
            // If we're in linear mode, consider each turn as matching the condition.
            if (linear || simulation.state === 'GOOD' || simulation.state === 'EXCELLENT') {
                simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks--;
            }
            // When it reaches the end, progress is increased
            if (simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks === 0) {
                // TODO
            }
        };
    }

}
