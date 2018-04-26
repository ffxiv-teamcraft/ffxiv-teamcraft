import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class Manipulation extends BuffAction {

    getBaseCPCost(simulationState: Simulation): number {
        return 88;
    }

    protected getBuff(): Buff {
        return Buff.MANIPULATION;
    }

    protected getDuration(simulation: Simulation): number {
        return 3;
    }

    getIds(): number[] {
        return [278];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return (simulation: Simulation) => {
            simulation.repair(10);
        };
    }

}
