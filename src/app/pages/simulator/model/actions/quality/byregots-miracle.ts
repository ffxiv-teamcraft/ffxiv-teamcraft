import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {QualityAction} from '../quality-action';

export class ByregotsMiracle extends QualityAction {

    canBeUsed(simulationState: Simulation): boolean {
        return simulationState.hasBuff(Buff.INNER_QUIET) && simulationState.crafterStats.specialist;
    }

    execute(simulation: Simulation): void {
        // Don't add stack now, We'll add it manually after the reduction is done.
        super.execute(simulation, true);
        // Divides stacks by 2, but adds one because it increased progression (done by QualityAction implementation)
        simulation.getBuff(Buff.INNER_QUIET).stacks = Math.floor(simulation.getBuff(Buff.INNER_QUIET).stacks / 2);
        simulation.getBuff(Buff.INNER_QUIET).stacks++;
    }

    onFail(simulation: Simulation): void {
        // Stacks are still reduces upon failing.
        simulation.getBuff(Buff.INNER_QUIET).stacks = Math.floor(simulation.getBuff(Buff.INNER_QUIET).stacks / 2)
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
        return 100 + (simulation.getBuff(Buff.INNER_QUIET).stacks - 1) * 15;
    }
}
