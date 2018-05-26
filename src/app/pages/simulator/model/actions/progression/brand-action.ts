import {ProgressAction} from '../progress-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export abstract class BrandAction extends ProgressAction {

    abstract getBuffedBy(): Buff;

    _canBeUsed(simulationState: Simulation, linear?: boolean): boolean {
        return true;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 6;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 90;
    }

    getPotency(simulation: Simulation): number {
        // TODO Recipe affinity
        let potency = 100;
        if (simulation.hasBuff(this.getBuffedBy())) {
            potency += 200 * (1 - simulation.progression / simulation.recipe.progress);
        }
        return potency;
    }

}
