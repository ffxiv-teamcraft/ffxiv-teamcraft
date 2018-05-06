import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {ActionType} from '../action-type';

export class ComfortZone extends BuffAction {

    public getType(): ActionType {
        return ActionType.CP_RECOVERY;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 66;
    }

    protected getBuff(): Buff {
        return Buff.COMFORT_ZONE;
    }

    getDuration(simulation: Simulation): number {
        return 10;
    }

    getIds(): number[] {
        return [286];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return (simulation) => {
            simulation.availableCP += 8;
            if (simulation.availableCP > simulation.maxCP) {
                simulation.availableCP = simulation.maxCP;
            }
        }
    }

}
