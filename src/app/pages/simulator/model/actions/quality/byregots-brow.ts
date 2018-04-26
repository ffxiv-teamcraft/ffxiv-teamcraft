import {ByregotsBlessing} from './byregots-blessing';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class ByregotsBrow extends ByregotsBlessing {


    getBaseCPCost(simulationState: Simulation): number {
        return 18;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return simulationState.crafterStats.specialist ? 100 : 70;
    }

    getPotency(simulation: Simulation): number {
        return 150 + simulation.getBuff(Buff.INNER_QUIET).stacks * 10;
    }
}
