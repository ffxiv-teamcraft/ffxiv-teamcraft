import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {QualityAction} from '../quality-action';

export class ByregotsMiracle extends QualityAction {

    canBeUsed(simulationState: Simulation): boolean {
        return simulationState.hasBuff(Buff.INNER_QUIET) && simulationState.crafterStats.specialist;
    }

    execute(simulation: Simulation): void {
        super.execute(simulation);
        simulation.getBuff(Buff.INNER_QUIET).stacks = Math.floor(simulation.getBuff(Buff.INNER_QUIET).stacks / 2);
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 70;
    }

    getIds(): number[] {
        return [100145, 100146, 100147, 100148, 100149, 100150, 100151, 100152];
    }

    getPotency(simulation: Simulation): number {
        return 100 + simulation.getBuff(Buff.INNER_QUIET).stacks * 20;
    }
}
